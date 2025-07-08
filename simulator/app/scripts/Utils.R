setClassUnion("numericOrNULL", c("numeric", "NULL"))


setClass("Parameters",
         slots=c(functional_effects="vector",
                 I="numeric",
                 lambda="numeric",
                 mu="numeric",
                 Competition="matrix",
                 influence="matrix",
                 K="numeric",
                 print_time="numeric",
                 av_lifespan="numeric"
                # tmax="numericOrNULL",
                # Ncellsmax="numericOrNULL"
                )
)


setGeneric("int_to_binary",function(decimal_num) standardGeneric("int_to_binary"))
setMethod("int_to_binary",
          signature(decimal_num="numeric"),
          function(decimal_num){
            if (decimal_num == 0) {
              return(c(0))
            }
            
            binary_vector <- integer(0)
            
            while (decimal_num > 0) {
              remainder <- decimal_num %% 2
              binary_vector <- c(remainder, binary_vector)
              decimal_num <- decimal_num %/% 2
            }
            
            return(as.integer(binary_vector))
          }
)

setGeneric("number2binary",function(decimal_nums, NofBits) standardGeneric("number2binary"))
setMethod("number2binary",
          signature(decimal_nums="numeric",
                    NofBits="numeric"),
          function(decimal_nums, NofBits){
            binary_matrix<-matrix(0,length(decimal_nums),NofBits)
            for(i in 1:length(decimal_nums)){
              int<-as.integer(decimal_nums[i])
              binary_matrix[i,NofBits:(NofBits-sizeinbase(int,2)+1)]<-rev(int_to_binary(int))
            }
            return(binary_matrix)
          }
)

setGeneric("binary2number",function(binary_nums) standardGeneric("binary2number"))
setMethod("binary2number",
          signature(binary_nums="matrix"),
          function(binary_nums){
            decimal_nums<-binary2number(binary_nums[,1])
            if(ncol(binary_nums)>1){
              for(col in 2:ncol(binary_nums)){
                decimal_nums<-c(decimal_nums,binary2number(binary_nums[,col]))
              }
            }
            return(decimal_nums)
          }
)
setMethod("binary2number",
          signature(binary_nums="numeric"),
          function(binary_nums){
            return(sum(2^(0:(length(binary_nums)-1))*rev(binary_nums)))
          }
)

setGeneric("conversion",function(phenotype,I) standardGeneric("conversion"))
setMethod("conversion",
          signature(phenotype="numeric",
                    I="numeric"),
          function(phenotype,I){
            new_vector_bin<-rep(0,I)
            new_vector_bin[phenotype]<-1
            return(binary2number(new_vector_bin))
          }
)

setGeneric("get_obs_tumor",function(parameters,tumor,sensibility) standardGeneric("get_obs_tumor"))
setMethod("get_obs_tumor",
          signature(parameters="Parameters",
                    tumor="list",
                    sensibility="numeric"),
          function(parameters,tumor,sensibility){
          Populations<-lapply(unlist(tumor),Population)%>%unique()
          
          genotypes<-sapply(Populations,genotype)
          
          Pop_ID<-tibble(Populations)%>%
            rownames_to_column()%>%
            rename("Population_ID"="rowname")
          
          NFcells_clones<-lapply(tumor,
                                 function(tum_time_fix){
                                   Ncells_clone<-sapply(tum_time_fix,
                                                        function(pop_with_size_nmut){
                                                          Ncells_clone<-0
                                                          for(pop_with_size_nmut_1 in tum_time_fix){
                                                            pop<-pop_with_size_nmut@Population
                                                            pop_1<-pop_with_size_nmut_1@Population
                                                            if(is_descendant(Population_younger = pop_1,
                                                                             Population_older = pop)){
                                                              Ncells_clone<-Ncells_clone+pop_with_size_nmut_1@Ncells
                                                            }
                                                          }
                                                          return(Ncells_clone)
                                                        }
                                   )
                                   Fcells_clone<-Ncells_clone/sum(sapply(tum_time_fix,Ncells))
                                   return(list(Ncells_clone=Ncells_clone,Fcells_clone=Fcells_clone))
                                 }
          )
          
          genotypes_collapsed<-sapply(genotypes,paste,collapse="_")
          
          tumor_ID<-lapply(tumor,
                           function(tum_time_fix){
                             genotypes_time_fix<-sapply(tum_time_fix,function(pop_with_size_nmut){
                               paste(pop_with_size_nmut@Population@genotype,collapse="_")
                             })
                             pop_ID<-sapply(genotypes_time_fix,function(gen){
                               which(gen==genotypes_collapsed)
                             })
                             return(pop_ID)
                           }
          )
          
          obs_clones<-unlist(mapply(
            function(tum,nfcells){
              return(tum[nfcells$Fcells_clone>sensibility])
            },
            tumor_ID,
            NFcells_clones,
            SIMPLIFY = TRUE
          ))%>%
            unique()
          
          for(i in obs_clones){
            pop_y<-Pop_ID$Populations[Pop_ID$Population_ID==i][[1]]
            
            ancestors<-Pop_ID$Population_ID[(sapply(Pop_ID$Populations,
                                         function(pop_old){
                                           is_ancestor(pop_old,pop_y)}))]
            obs_clones<-unique(c(obs_clones,ancestors))
          }
          
          
          obs_Pop_ID<-Pop_ID%>%
            filter(Population_ID%in%obs_clones)
          
          lapply(obs_Pop_ID$Populations,genotype)
          
          obs_tumor_list<-mapply(function(tum_time_fix,tum_id){
            Ncells_obs<-sapply(tum_time_fix[tum_id%in%obs_clones],
                               function(pop_with_size_nmut){
                                 Ncells_clone<-pop_with_size_nmut@Ncells
                                 for(pop_with_size_nmut_1 in tum_time_fix[!tum_id%in%obs_clones]){
                                   pop<-pop_with_size_nmut@Population
                                   pop_1<-pop_with_size_nmut_1@Population
                                   if(is_descendant(Population_younger = pop_1,
                                                    Population_older = pop)){
                                     Ncells_clone<-Ncells_clone+pop_with_size_nmut_1@Ncells
                                   }
                                 }
                                 return(Ncells_clone)
                               }
            )
            return(bind_cols(Population_ID=tum_id[tum_id%in%obs_clones],
                             Ncells=Ncells_obs))
          },
          tumor,
          tumor_ID,
          SIMPLIFY=FALSE
          )
          
         
          obs_tumor_tibble<-bind_rows(obs_tumor_list,.id = "time")
          #obs_tumor_tibble$time<-as.numeric(obs_tumor_tibble$time)/(max(as.numeric(obs_tumor_tibble$time))-min(as.numeric(obs_tumor_tibble$time)))*parameters@ymax
          obs_tumor_tibble$Population_ID<-as.character(obs_tumor_tibble$Population_ID)
          
          return(
            list(
              obs_Pop_ID=obs_Pop_ID,
              obs_tumor_tibble=obs_tumor_tibble)
          )
          })

setGeneric("get_muller_plot_info",function(obs_Pop_ID,obs_tumor_tibble,functional_effects,freq) standardGeneric("get_muller_plot_info"))
setMethod("get_muller_plot_info",
          signature(obs_Pop_ID="tbl",
                    obs_tumor_tibble="tbl",
                    functional_effects="vector",
                    freq="logical"),
          function(obs_Pop_ID,obs_tumor_tibble,functional_effects,freq){
            
            
            tryCatch(expr = {
              
              time_of_appearance<-obs_tumor_tibble%>%
                group_by(Population_ID)%>%
                summarise(time_of_appearance=time[1])%>%
                ungroup()
              
              pop<-obs_Pop_ID$Populations
              
              Pop_ID<-obs_Pop_ID$Population_ID%>%unique()
              
              ancestors<-lapply(pop,
                                function(p){
                                  Pop_ID[
                                    sapply(pop,
                                           function(p1){
                                             is_descendant(p,p1)
                                           })
                                  ]
                                })
              
              
              daughters<-lapply(pop,
                                function(p){
                                  Pop_ID[
                                    sapply(pop,
                                           function(p1){
                                             is_parent(p1,p)
                                           })
                                  ]
                                })
              
              n_sons<-tibble(Population_ID=obs_Pop_ID$Population_ID,n=lengths(daughters))
              
              fun_eff<-sapply(pop,function(p){
                paste(names(functional_effects[sort(p@phenotype)]),collapse = ", ")
              })
              
              
              daughters_ordered<-lapply(daughters,
                                        function(d){
                                          time_of_appearance%>%
                                            filter(Population_ID%in%d)%>%
                                            arrange(time_of_appearance)%>%
                                            pull(Population_ID)
                                        })
              daughters_ordered_tbl<-tibble(Population_ID=obs_Pop_ID$Population_ID,daughters=daughters_ordered)
              
              
              if(freq==FALSE){
                obs_tumor_tibble_clones<-tibble(Population_ID=Pop_ID,ancestors)%>%
                  unnest(ancestors)%>%
                  full_join(obs_tumor_tibble)%>%
                  group_by(ancestors,time)%>%
                  mutate(Ncells_clone=sum(Ncells))%>%
                  ungroup()%>%
                  dplyr::select(ancestors,time,Ncells_clone)%>%
                  distinct()%>%
                  rename("clone"="ancestors")%>%
                  left_join(tibble(clone=Pop_ID,fun_eff))
                
                
                root<-unlist(ancestors[lengths(ancestors)==1])
                pop_with_sons<-n_sons$Population_ID[n_sons$n>0]
                
                if(length(root)>1){
                  obs_tumor_tibble_clones<-bind_rows(
                    obs_tumor_tibble_clones%>%
                      filter(clone%in%root)%>%
                      group_by(time)%>%
                      summarize(clone=0,
                                Ncells_clone=sum(Ncells_clone),
                                fun_eff=NA),
                    obs_tumor_tibble_clones)
                  pop_with_sons<-c(0,n_sons$Population_ID[n_sons$n>0])
                  daughters_ordered<-append(list(root),daughters_ordered)
                  daughters_ordered_tbl<-bind_rows(tibble(Population_ID=0,
                                                          daughters=list(root)),daughters_ordered_tbl)
                  root<-0
                }
                
                Clones_df<-obs_tumor_tibble_clones%>%
                  filter(clone%in%root)%>%
                  mutate(y_lower=-Ncells_clone/2,
                         y_upper=Ncells_clone/2,
                         time_appearance=0)
                
                for(p in pop_with_sons){
                  daughters_p<-daughters_ordered_tbl$daughters[daughters_ordered_tbl$Population_ID==p][[1]]
                  n_siblings_d<-length(daughters_p)
                  time_appearance_p<-time_of_appearance$time_of_appearance[time_of_appearance$Population_ID==p]
                  
                  
                  for(d in daughters_p){
                    sibling_number<-which(daughters_p==d)
                    older_siblings<-daughters_p[0:(sibling_number-1)]
                    
                    prop_y_start<-sibling_number/(n_siblings_d+1)
                    
                    time_appearance_d<-time_of_appearance$time_of_appearance[time_of_appearance$Population_ID==d]
                    
                    Ncells_parent_appearance<-obs_tumor_tibble$Ncells[obs_tumor_tibble$Population_ID==p&
                                                                        obs_tumor_tibble$time==time_appearance_d]
                    center_parent<-Clones_df%>%
                      filter(clone==p)%>%
                      mutate(center=(y_upper+y_lower)/2)%>%
                      dplyr::select(time,center)
                    
                    Ncells_parent<-obs_tumor_tibble[obs_tumor_tibble$Population_ID==p,c("time","Ncells")]%>%
                      rename("Ncells_p"="Ncells")
                    
                    Ncells_parent_clone<-obs_tumor_tibble_clones[obs_tumor_tibble_clones$clone==p,c("time","Ncells_clone")]%>%
                      rename("Ncells_p_clone"="Ncells_clone")
                    
                    Ncells_older_siblings<-obs_tumor_tibble_clones[obs_tumor_tibble_clones$clone%in%older_siblings,]%>%
                      group_by(time)%>%
                      summarize(Ncells_s=sum(Ncells_clone))
                    
                    d_df<-full_join(Ncells_parent,Ncells_parent_clone,by="time")%>%
                      full_join(Ncells_older_siblings,by="time")%>%
                      full_join(obs_tumor_tibble_clones%>%
                                  filter(clone==d),by="time")%>%
                      full_join(center_parent,by="time")%>%
                      filter(!is.na(clone))%>%
                      rowwise()%>%
                      mutate(y_lower=sum(center,prop_y_start*Ncells_p,-Ncells_p_clone/2,Ncells_s,na.rm=TRUE),
                             y_upper=y_lower+Ncells_clone,
                             time_appearance=time_appearance_d)%>%
                      dplyr::select(clone,time,Ncells_clone,"fun_eff",y_lower,y_upper,time_appearance)
                    
                    Clones_df<-rbind(Clones_df,d_df)
                    
                  }
                }
                Clones_df<-Clones_df%>%
                  filter(clone!=0)
                
                trasl<-min(Clones_df$y_lower)
                Clones_df$y_lower<-Clones_df$y_lower-trasl
                Clones_df$y_upper<-Clones_df$y_upper-trasl
                Clones_df$time<-as.numeric(Clones_df$time)
                Clones_df$clone<-factor(Clones_df$clone,levels=Pop_ID)
                
                return(Clones_df)
              }
              else{
                obs_tumor_tibble<-obs_tumor_tibble%>%
                  group_by(time)%>%
                  mutate(
                    tot_Ncells=sum(Ncells),
                    Fcells=Ncells/tot_Ncells)
                obs_tumor_tibble_clones<-tibble(Population_ID=Pop_ID,ancestors)%>%
                  unnest(ancestors)%>%
                  full_join(obs_tumor_tibble)%>%
                  group_by(ancestors,time)%>%
                  mutate(Fcells_clone=sum(Fcells))%>%
                  ungroup()%>%
                  dplyr::select(ancestors,time,Fcells_clone)%>%
                  distinct()%>%
                  rename("clone"="ancestors")%>%
                  left_join(tibble(clone=Pop_ID,fun_eff))
                
                root<-unlist(ancestors[lengths(ancestors)==1])
                pop_with_sons<-n_sons$Population_ID[n_sons$n>0]
                
                if(length(root)>1){
                  obs_tumor_tibble_clones<-bind_rows(
                    tibble(clone=0,
                           time=unique(obs_tumor_tibble_clones$time),
                           Fcells_clone=1,
                           fun_eff="competition"),
                    obs_tumor_tibble_clones)
                  pop_with_sons<-c(0,n_sons$Population_ID[n_sons$n>0])
                  daughters_ordered<-append(list(root),daughters_ordered)
                  daughters_ordered_tbl<-bind_rows(tibble(Population_ID=0,
                                                          daughters=list(root)),daughters_ordered_tbl)
                  root<-0
                }
                
                Clones_df<-obs_tumor_tibble_clones%>%
                  filter(clone==root)%>%
                  mutate(y_lower_frac=-Fcells_clone/2,
                         y_upper_frac=Fcells_clone/2)
                
                for(p in pop_with_sons){
                  daughters_p<-daughters_ordered_tbl$daughters[daughters_ordered_tbl$Population_ID==p][[1]]
                  n_siblings_d<-length(daughters_p)
                  
                  for(d in daughters_p){
                    sibling_number<-which(daughters_p==d)
                    older_siblings<-daughters_p[0:(sibling_number-1)]
                    
                    prop_y_start<-sibling_number/(n_siblings_d+1)
                    
                    time_appearance_d<-time_of_appearance$time_of_appearance[time_of_appearance$Population_ID==d]
                    
                    Fcells_parent_appearance<-obs_tumor_tibble$Fcells[obs_tumor_tibble$Population_ID==p&
                                                                        obs_tumor_tibble$time==time_appearance_d]
                    center_parent<-Clones_df%>%
                      filter(clone==p)%>%
                      mutate(center=(y_upper_frac+y_lower_frac)/2)%>%
                      dplyr::select(time,center)
                    
                    Fcells_parent<-obs_tumor_tibble[obs_tumor_tibble$Population_ID==p,c("time","Fcells")]%>%
                      rename("Fcells_p"="Fcells")
                    
                    Fcells_parent_clone<-obs_tumor_tibble_clones[obs_tumor_tibble_clones$clone==p,c("time","Fcells_clone")]%>%
                      rename("Fcells_p_clone"="Fcells_clone")
                    
                    Fcells_older_siblings<-obs_tumor_tibble_clones[obs_tumor_tibble_clones$clone%in%older_siblings,]%>%
                      group_by(time)%>%
                      summarize(Fcells_s=sum(Fcells_clone))
                    
                    d_df<-full_join(Fcells_parent,Fcells_parent_clone,by="time")%>%
                      full_join(Fcells_older_siblings,by="time")%>%
                      full_join(obs_tumor_tibble_clones%>%
                                  filter(clone==d),by="time")%>%
                      full_join(center_parent,by="time")%>%
                      filter(!is.na(clone))%>%
                      rowwise()%>%
                      mutate(y_lower_frac=sum(center,prop_y_start*Fcells_p,-Fcells_p_clone/2,Fcells_s,na.rm=TRUE),
                             y_upper_frac=y_lower_frac+Fcells_clone)%>%
                      dplyr::select(time,clone,Fcells_clone,fun_eff,y_lower_frac,y_upper_frac)
                    
                    Clones_df<-rbind(Clones_df,d_df)
                    
                  }
                }
                
                Clones_df<-Clones_df%>%
                  filter(clone!=0)
                Clones_df$y_lower_frac<-Clones_df$y_lower_frac+0.5
                Clones_df$y_upper_frac<-Clones_df$y_upper_frac+0.5
                Clones_df$clone<-factor(Clones_df$clone,levels=Pop_ID)
                Clones_df$time<-as.numeric(Clones_df$time)
                
                return(Clones_df)
              }
              
            },
            error=function(cond) {
              message(conditionMessage(cond))
            })
            
          })


setGeneric("get_muller_plot_show",function(Clones_df,freq,palette) standardGeneric("get_muller_plot_show"))
setMethod("get_muller_plot_show",
          signature(Clones_df="tbl",
                    freq="logical",
                    palette="vector"),
          function(Clones_df,freq,palette){
            
            tryCatch(expr = {
              
              fun_eff<-Clones_df$fun_eff
              
              palette<-palette[sort(unique(fun_eff))]
              
              palette_light<-lighten(palette,amount = 0.1)
              names(palette_light)<-names(palette)
              palette_dark<-darken(palette,amount = 0.3)
              names(palette_dark)<-names(palette)
              
              
              if(freq==FALSE){
                
                p<-ggplot()+
                  geom_ribbon(data=Clones_df,
                              aes(x=time,
                                  ymin = y_lower,
                                  ymax=y_upper,
                                  group=clone,
                                  color=fun_eff,
                                  fill=fun_eff))+
                  scale_fill_manual(values=palette)+
                  scale_color_manual(values=palette_dark,guide = "none")+
                  scale_x_continuous(breaks=round(seq(min(Clones_df$time),max(Clones_df$time),length.out=5)))+
                  theme_void()+
                  theme(
                    legend.position ="none",
                    plot.margin =  unit(c(-17.5,-33,-17.5,-33), "pt"),
                    axis.ticks.length = unit(0,"cm"),
                    axis.ticks.margin = unit(0,"cm")
                  )
              }
              else{
                p<-ggplot(Clones_df)+
                  geom_ribbon(aes(x=time,
                                  ymin = y_lower_frac,
                                  ymax=y_upper_frac,
                                  group=clone,
                                  fill=fun_eff,
                                  col=fun_eff))+
                  geom_rect(xmin = min(Clones_df$time),
                            xmax=max(Clones_df$time),
                            ymin=0,
                            ymax=1,
                            fill="transparent",
                            color="black")+
                  theme_void()+
                  scale_fill_manual(values=palette)+
                  scale_color_manual(values=palette_dark,guide = "none")+
                  guides(fill=guide_legend(title="Functional effect:",override.aes = list(color = palette_dark)))+
                  theme(
                    legend.position ="none",
                    plot.margin =  unit(c(-17,-32,-17,-32), "pt"),
                    axis.ticks.length = unit(0,"cm"),
                    axis.ticks.margin = unit(0,"cm")
                  )
                
              }
              return(p)
            },
            error=function(cond) {
              message(conditionMessage(cond))
              ggplot() +
                annotate("text",
                         x = 1,
                         y = 1,
                         label = "Error in the muller plot",
                         size = 6,
                         fontface = "bold") +
                theme_void()
            })
          })

setGeneric("get_muller_plot_download",function(Clones_df,freq,palette) standardGeneric("get_muller_plot_download"))
setMethod("get_muller_plot_download",
          signature(Clones_df="tbl",
                    freq="logical",
                    palette="vector"),
          function(Clones_df,freq,palette){
            
            tryCatch(expr = {
              
              fun_eff<-Clones_df$fun_eff
              
              palette<-palette[sort(unique(fun_eff))]
              
              palette_light<-lighten(palette,amount = 0.1)
              names(palette_light)<-names(palette)
              palette_dark<-darken(palette,amount = 0.3)
              names(palette_dark)<-names(palette)
              
              if(freq==FALSE){

                latex_label_k<-scales::scientific(max(Clones_df$Ncells_clone), digits = 1)
                latex_label_k<-str_split(latex_label_k,"e",simplify = TRUE)
                if(latex_label_k[1,1]=="1"){latex_label_k[1,1]<-""}
                if(grepl(x=latex_label_k[1,2],pattern="+")){
                  latex_label_k[1,2]<-gsub(x=latex_label_k[1,2],pattern="+","",fixed = TRUE)}
                latex_label_k[1,2]<-gsub(x=latex_label_k[1,2],pattern="^0+","")
                if(latex_label_k[1,2]==""&latex_label_k[1,1]!=""){
                  latex_label_k<-paste("$",latex_label_k[1,1],"$",sep="")
                }else if(latex_label_k[1,1]==""&latex_label_k[1,2]!=""){
                  latex_label_k<-paste("$10^{",latex_label_k[1,2],"}$",sep="")
                }else if(latex_label_k[1,1]!=""&latex_label_k[1,2]!=""){
                  latex_label_k<-paste(paste(paste(c("$","\\cdot 10^{"),latex_label_k,sep=""),collapse = ""),"}$",sep="")
                }else{
                  latex_label_k<-"$1$"
                }
                
                p<-ggplot()+
                  geom_ribbon(data=Clones_df,
                              aes(x=time,
                                  ymin = y_lower,
                                  ymax=y_upper,
                                  group=clone,
                                  color=fun_eff,
                                  fill=fun_eff))+
                  scale_fill_manual(values=palette)+
                  geom_segment(aes(x=max(Clones_df$time)*(1+1/20),
                                   xend = max(Clones_df$time)*(1+1/20),
                                   y=min(Clones_df$y_lower),
                                   yend=max(Clones_df$y_upper)
                  ),arrow = arrow(ends="both",length = unit(5, "points")))+
                  geom_label(aes(x=max(Clones_df$time)*(1+1/20),
                                 y=(min(Clones_df$y_lower)+max(Clones_df$y_upper))/2),
                             label = TeX(latex_label_k),
                             size=3,
                             label.size = NA)+
                  scale_color_manual(values=palette_dark,guide = "none")+
                  xlab("Days")+
                  ylab("Absolute Aboundance")+
                  scale_x_continuous(breaks=round(seq(min(Clones_df$time),max(Clones_df$time),length.out=5)))+
                  guides(fill=guide_legend(title="Phenotype:",override.aes = list(color = palette_dark)))+
                  theme_void()+
                  theme(
                    axis.title.x = element_text(size=14),
                    axis.title.y = element_text(size=14,angle=90,vjust=2),
                    axis.text.y = element_blank(),
                    plot.margin = unit(c(0,0,0,0.2), "cm"),
                    axis.text.x = element_text(size=12,vjust = 3),
                    legend.position ="bottom",
                    legend.box = "vertical"
                  )
                
                
                return(p)
                
              }
              else{
                
                p<-ggplot(Clones_df)+
                  geom_ribbon(aes(x=time,
                                  ymin = y_lower_frac,
                                  ymax=y_upper_frac,
                                  group=clone,
                                  fill=fun_eff,
                                  col=fun_eff))+
                  geom_rect(xmin = min(Clones_df$time),
                            xmax=max(Clones_df$time),
                            ymin=0,
                            ymax=1,
                            fill="transparent",
                            color="black")+
                  theme_void()+
                  scale_fill_manual(values=palette)+
                  scale_color_manual(values=palette_dark,guide = "none")+
                  labs(x ="Days",
                       y="Relative Aboundance")+
                  guides(fill=guide_legend(title="Phenotype:",override.aes = list(color = palette_dark)))+
                  theme(
                    axis.title.x = element_text(size=14),
                    axis.title.y = element_text(size=14,angle=90,vjust = 2.5),
                    axis.text.y = element_text(size=12,hjust = -5),
                    plot.margin = unit(c(0,0,0,0.2), "cm"),
                    axis.text.x = element_text(size=12,vjust = 3),
                    legend.position = "none"
                  )
                return(p)
                
              }
              
            },
            error=function(cond) {
              message(conditionMessage(cond))
              ggplot() +
                annotate("text",
                         x = 1,
                         y = 1,
                         label = "Error in the muller plot",
                         size = 6,
                         fontface = "bold") +
                theme_void()
            })
          })


elbowed_link_right_up<-function(x1,y1,x2,y2,r){
  
  theta <- seq(-pi/2, 0, length.out = 20)  
  arc <- data.frame(
    x = x2 - r + r * cos(theta),
    y = y1 +r + r * sin(theta)
  )
  
  path <- bind_rows(
    data.frame(x = c(x1, x2-r), y = c(y1, y1)),  
    arc,
    data.frame(x = c(x2, x2), y = c(y1 + r, y2))   
  )
  return(path)
}

elbowed_link_right_down<-function(x1,y1,x2,y2,r){
  theta <- seq(pi/2, 0, length.out = 20)  # 0 to 90 degrees
  arc <- data.frame(
    x = x2 -r + r * cos(theta),
    y = y1 -r  + r * sin(theta)
  )
  
  path <- bind_rows(
    data.frame(x = c(x1, x2-r), y = c(y1, y1)),  # horizontal
    arc,
    data.frame(x = c(x2, x2), y = c(y1 -r, y2))   # vertical
  )
  return(path)
}

elbowed_link_up_right<-function(x1,y1,x2,y2,r){
  theta <- seq(pi, pi/2, length.out = 20)  # 0 to 90 degrees
  arc <- data.frame(
    x = x1 +r + r * cos(theta),
    y = y2 -r  + r * sin(theta)
  )
  
  path <- bind_rows(
    data.frame(x = c(x1, x1), y = c(y1, y2-r)),  # horizontal
    arc,
    data.frame(x = c(x1+r, x2), y = c(y2, y2))   # vertical
  )
  return(path)
}

elbowed_link_down_right<-function(x1,y1,x2,y2,r){
  theta <- seq(pi, 3*pi/2, length.out = 20)  # 0 to 90 degrees
  arc <- data.frame(
    x = x1 + r + r * cos(theta),
    y = y2 + r  + r * sin(theta)
  )
  
  path <- bind_rows(
    data.frame(x = c(x1, x1), y = c(y1, y2+r)),  # horizontal
    arc,
    data.frame(x = c(x1+r, x2), y = c(y2, y2))   # vertical
  )
  return(path)
}

elbowed_link<-function(x1,y1,x2,y2,r,x_mean){
  x_left<-min(x1,x2)
  x_right<-max(x1,x2)
  y_left<-c(y1,y2)[which.min(c(x1,x2))]
  y_right<-c(y1,y2)[which.max(c(x1,x2))]
  
  x_mid<-x_mean
  y_mid<-mean(c(y1,y2))
  
  
  if(y_left<y_right){
    link<-bind_rows(elbowed_link_right_up(x_left,y_left,x_mid,y_mid,r),
                    elbowed_link_up_right(x_mid,y_mid,x_right,y_right,r))
  }else if(y_left>y_right){
    link<-bind_rows(elbowed_link_right_down(x_left,y_left,x_mid,y_mid,r),
                    elbowed_link_down_right(x_mid,y_mid,x_right,y_right,r))
  }else{
    link<-tibble(x=c(x_left,x_right),y=c(y_left,y_right))
  }
  return(link)
}

get_tree_plot_app<-function(df,palette){
  if(nrow(df)==1){
    wanted_mut<-"1"
    plot<-ggplot(df)+
      geom_label(aes(x=0,y=0,label="Mut1",
                     fill=fun_eff),
                 label="Mut1",
                 #size=1.5,
                 size=size_label,
                 label.r =unit(0.5,"lines"),
                 label.size = 0)+
      xlim(-0.1,0.1)+
      ylim(-0.1,0.1)+
      coord_fixed()+
      scale_fill_manual(values=c("#F7CE5B","#0CBABA","#A53860"),na.value = "white")+
      theme_void()+
      theme(legend.position = "none")
  }
  else{
    wanted_mut<-unname(
      unlist(
        lapply(split(df$mut,
                     df$parents),
               function(v){
                 v_filt<-v[(v%in%unique(df$parents))]
                 v_filt<-c(v_filt,v[!v%in%v_filt][1])
                 return(v_filt)
               }
        )
      )
    )
    
    wanted_mut<-unique(c(wanted_mut,unique(df$mut[is.na(df$parents)])))

    mut_info<-df%>%
      mutate(wanted=ifelse(mut%in%wanted_mut,TRUE,FALSE))%>%
      group_by(parents)%>%
      summarise(ndaught_drawn=sum(wanted),
                ndaught_hidden=n()-ndaught_drawn)%>%
      filter(!is.na(parents)&ndaught_hidden>0)%>%
      rowwise()%>%
      mutate(mut=paste(parents,"n",sep="_"),
             label=paste(ndaught_hidden,"more"),
             fun_eff=as.character(NA),
             mut_generation=df$mut_generation[df$mut==parents]+1)%>%
      dplyr::select(mut,parents,label,mut_generation,fun_eff)%>%
      ungroup()
    
    mut_info<-df%>%
      filter(mut%in%wanted_mut)%>%
      mutate(label=paste("mut",row_number(),sep=""))%>%
      dplyr::select(mut,parents,label,fun_eff,mut_generation)%>%
      bind_rows(mut_info)

    g <- graph_from_data_frame(mut_info%>%dplyr::select(parents,mut)%>%filter(!is.na(parents)), directed = TRUE)
    layout_df <- create_layout(g, layout = "dendrogram", circular = FALSE)
    
    x_grid<-length(unique(layout_df$y))
    y_grid<-sum(layout_df$leaf)
    x_range<-c(0,1.2)
    y_range<-c(0,1)
    
    layout_df<-layout_df%>%
      filter(name!=0)%>%
      rowwise()%>%
      mutate(y=x_grid-mut_info$mut_generation[mut_info$mut==name])%>%
      ungroup()
    
    nodes_coord<-tibble(x=rescale(-layout_df$y,to=x_range),
                        y=rescale(-layout_df$x,to=y_range),
                        mut=layout_df$name)%>%
      merge(mut_info%>%dplyr::select(mut,label,fun_eff,mut_generation))%>%
      group_by(mut_generation)%>%
      mutate(n_mut_layer=n())
    
    size_label<-min(40/max(nodes_coord$n_mut_layer),6)
    
    
    mid_pts<-unique(nodes_coord$x)+x_range[2]/x_grid
    
    edges_coord<-tibble(
      x1=sapply(mut_info$parents[!is.na(mut_info$parents)],
                function(parent){nodes_coord$x[nodes_coord$mut==parent]}),
      y1=sapply(mut_info$parents[!is.na(mut_info$parents)],
                function(parent){nodes_coord$y[nodes_coord$mut==parent]}),
      x2=sapply(mut_info$mut[!is.na(mut_info$parents)],
                function(mut){nodes_coord$x[nodes_coord$mut==mut]}),
      y2=sapply(mut_info$mut[!is.na(mut_info$parents)],
                function(mut){nodes_coord$y[nodes_coord$mut==mut]}),
      x_mid=sapply(mut_info$mut[!is.na(mut_info$parents)],
                   function(mut){mid_pts[mut_info$mut_generation[mut_info$mut==mut]-1]})
    )
    
    radius<-edges_coord%>%
      rowwise()%>%
      mutate(r=min(abs(x1-x2),abs(y1-y2))/2)%>%
      pull(r)
    
    r<-min(radius[radius>0])
    
    link<-edges_coord%>%
      rowwise()%>%
      mutate(link=list(as_tibble(elbowed_link(x1,y1,x2,y2,r,x_mid))))%>%
      ungroup()%>%
      pull(link)%>%bind_rows(.id="mut")
    
    x_lim<-range(nodes_coord$x)+c(-0.1,0.1)
    y_lim<-range(nodes_coord$y)+c(-0.1,0.1)
    plot<-ggplot()+
      geom_path(data=link,
                aes(x=x,y=y,group=mut))+
      geom_label(data=nodes_coord,
                 aes(x=x,y=y,label=label,
                     fill=fun_eff),
                 #size=1.5,
                 size=size_label,
                 label.r =unit(0.5,"lines"),
                 label.size = 0)+
      xlim(x_lim)+
      ylim(y_lim)+
      coord_fixed()+
      scale_fill_manual(values=c("#F7CE5B","#0CBABA","#A53860"),na.value = "white")+
      theme_void()+
      theme(legend.position = "none")
  }
  return(plot)
}

