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

setGeneric("get_edges",function(roots_tmp, vectors_tmp, edges = list()) standardGeneric("get_edges"))
setMethod("get_edges",
          signature(roots_tmp="vector",
                    vectors_tmp="vector",
                    edges="list"),
          function(roots_tmp, vectors_tmp, edges = list()) {
            for (root_tmp in roots_tmp) {
              vectors_tmp1 <- vectors_tmp[unlist(map(vectors_tmp, ~ root_tmp %in% .x))]
              if (any(sapply(vectors_tmp1, length) > 1)) {
                new_vectors <- vectors_tmp1[sapply(vectors_tmp1, length) != 1]
                new_vectors <- lapply(new_vectors, function(x) { x[x != root_tmp] })
                branches_roots <- new_vectors[sapply(new_vectors, length) == 1]
                
                edges <- get_edges(branches_roots, new_vectors, edges)
                edges <- append(map(branches_roots, ~ c(root_tmp, .x)),edges)
              }
            }
            return(edges)
          })

setGeneric("get_tree_plot",function(parameters,obs_Pop_ID) standardGeneric("get_tree_plot"))
setMethod("get_tree_plot",
          signature(parameters="Parameters",
                    obs_Pop_ID="tbl"),
          function(parameters,obs_Pop_ID){
            tryCatch(expr = {
              obs_unique_mut_ID<-obs_Pop_ID%>%
                rowwise()%>%
                mutate(obs_genotypes=list(genotype(Populations)),
                       obs_mut=list(obs_genotypes),
                       length_gen=length(obs_genotypes))%>%
                unnest(obs_mut)%>%
                rowwise()%>%
                mutate(pos_mut=which(obs_genotypes==obs_mut))%>%
                group_by(obs_mut,pos_mut)%>%
                mutate(min_length_gen=min(length_gen),
                       n=sum(length_gen==min_length_gen),
                       unique_obs_mut_ID=ifelse(
                         n>1,
                         paste0(
                           paste(LETTERS[pos_mut],
                                 obs_mut,
                                 sep=""),
                           1:n,
                           sep="-"),
                         paste(LETTERS[pos_mut],
                               obs_mut,
                               sep="")
                       )
                )%>%
                ungroup()%>%
                dplyr::select(Population_ID,unique_obs_mut_ID)%>%
                group_by(Population_ID)%>%
                mutate(unique_obs_mut_ID=list(unique_obs_mut_ID))%>%
                pull(unique_obs_mut_ID)%>%
                unique()
              
              
              obs_functional_effects<-obs_Pop_ID%>%
                rowwise()%>%
                mutate(obs_functional_effect=list(functional_effect(Populations)))%>%
                pull(obs_functional_effect)
              
              root <- as.character(Reduce(intersect, obs_unique_mut_ID))
              
              edges<-unlist(get_edges(root,obs_unique_mut_ID,edges = list()))
              
              g<-make_graph(edges=edges)
              
              palette<-as.character(moma.colors("Levine1",parameters@I))
              
              mut_functional_effects<-tibble(obs_unique_mut_ID,obs_functional_effects)%>%
                unnest(c(obs_unique_mut_ID,obs_functional_effects))%>%
                distinct()
              
              vertex_attr(g)$type<-mut_functional_effects$obs_functional_effects
              
              
              plot(g,#main=title,
                   edge.arrow.size=0.2,
                   edge.width=1,
                   vertex.color=palette[V(g)$type],
                   vertex.size=30,
                   vertex.frame.color=palette[V(g)$type],
                   vertex.label.color="white",
                   vertex.label.cex=0.5,
                   vertex.label.dist=0)
              legend("topright",  
                     legend = unique(mut_functional_effects$obs_functional_effects),  
                     col = palette[unique(mut_functional_effects$obs_functional_effects)],  
                     pch = 21,  
                     pt.bg = palette[unique(mut_functional_effects$obs_functional_effects)],  
                     pt.cex = 1.5,  
                     bty = "n", 
                     title = "Functional \n effects",
                     cex = 0.8) 
            },
            error=function(cond) {
              message(conditionMessage(cond))
              
              plot(0,0,axes=F,col="white")
              text(0,0, "Error in the tree plot")
              })
            
          })


setGeneric("get_my_tree_plot",function(obs_Pop_ID,obs_tumor_tibble,functional_effects) standardGeneric("get_my_tree_plot"))
setMethod("get_my_tree_plot",
          signature(obs_Pop_ID="tbl",
                    obs_tumor_tibble="tbl"),
          function(obs_Pop_ID,obs_tumor_tibble,functional_effects){
            tryCatch(expr = {
              
              palette<-as.character(moma.colors("Levine1",length(functional_effects)))
              table_f_e<-table(functional_effects)
              num_fun_eff<-sapply(table_f_e,function(n){1:n})
              
              if(!is.null(names(functional_effects))){
                names(palette)<-names(functional_effects)
              }else{
                names(palette)<-unlist(sapply(unique(functional_effects),
                                              function(name){
                                                if(sum(functional_effects==name)==1){name}
                                                else{paste0(name,num_fun_eff[[name]])}
                                              },
                                              simplify = TRUE
                ))
              }
              
              
              obs_tumor_tibble$time<-as.numeric(obs_tumor_tibble$time)
              
              unique_mut_id<-lapply(obs_Pop_ID$Populations,function(p){
                g<-genotype(p)
                unique_id_mut<-vector()
                for(i in 1:length(g)){
                  unique_id_mut<-c(unique_id_mut,paste(g[1:i],collapse="_"))
                }
                return(unique_id_mut)
              })
              
              Points<-tibble(obs_Pop_ID,obs_mut=unique_mut_id)%>%
                merge(obs_tumor_tibble%>%
                        group_by(Population_ID)%>%
                        filter(time==min(time)))%>%
                arrange(time)%>%
                rowwise()%>%
                mutate(obs_genotypes=list(genotype(Populations)),
                       length_gen=length(obs_genotypes),
                       pos_mut=list(1:length_gen),
                       functional_effect=list(get_fun_eff_label(Populations,functional_effects))
                       )%>%
                unnest(c(obs_mut,pos_mut,functional_effect))%>%
                group_by(pos_mut)%>%
                mutate(node=paste(LETTERS[pos_mut],
                                 1:length(unique(obs_mut)),
                                 sep="")
                       )%>%
                ungroup()%>%
                group_by(obs_genotypes)%>%
                mutate(parents=lag(node))%>%
                ungroup()%>%
                  group_by(node)%>%
                  filter(time==min(time))%>%
                dplyr::select(node,time,
                              functional_effect,parents)%>%
                distinct()
              
              get_ancestry <- function(node, data) {
                parent <- data$parents[data$node == node]
                if (length(parent) == 0 || all(is.na(parent))) {
                  return(node)
                } else {
                  return(c(get_ancestry(parent, data), node))
                }
              }
              
              ancestry<-lapply(Points$node,get_ancestry,data=Points)
              roots<-Points$node[lengths(ancestry)==min(lengths(ancestry))]
              
              Points <- Points %>%
                bind_cols(ancestry=sapply(ancestry,paste,collapse="_"))
              
              vertexes<-Points$node
              parents<-Points$parents
              names(parents)<-vertexes
              ancestry<-Points$ancestry
              names(ancestry)<-vertexes
              
              v<-Points$node
              num_sons<-vector()
              i<-0
              while(length(v)>0){
                p<-parents[v]
                ending_pts_provv<-v[!v%in%p]
                num_sons[ending_pts_provv]<-i
                i<-i+1
                v<-setdiff(v,ending_pts_provv)
              }
              
              
              y<-tibble()
              for(n_s in 0:max(num_sons)){
                ending_pts_provv<-names(num_sons[num_sons==n_s])
                par<-parents[ending_pts_provv]
                par[is.na(par)]<-"0"
                anc<-ancestry[ending_pts_provv]
                if(n_s==0){
                  y_ending_pts<-1:length(ending_pts_provv)-mean(1:length(ending_pts_provv))
                  y<-full_join(Points,tibble(node=names(sort(anc)),y_ending_pts))
                  
                }
                else{
                  y_tmp<-y%>%
                    filter(parents%in%ending_pts_provv)%>%
                    group_by(parents)%>%
                    summarise(y_ending_pts=mean(y_ending_pts))
                  y$y_ending_pts[y$node%in%y_tmp$parents]<-y_tmp$y_ending_pts
                }
              }
              
              Points<-merge(y,
                            Points)
              
              if(sum(Points$time==min(Points$time))>length(roots)){
                Points$time[Points$node==roots]<-Points$time[Points$node==roots]-1/10*(max(Points$time)-min(Points$time))
              }
              
              segments<-tibble()
              for(v in vertexes){
                p<-parents[v]
                arc<-paste(p,v,sep="_")
                if(!is.na(p)){
                  x<-Points$time[Points$node==p]
                  y<-Points$y_ending_pts[Points$node==p]
                  x_end<-Points$time[Points$node==v]
                  y_end<-Points$y_ending_pts[Points$node==v]
                  segments<-bind_rows(
                    segments,tibble(p,v,arc,x,y,x_end,y_end)
                  )
                }
              }
              
              min_y<-min(Points$y_ending_pts)
              max_y<-max(Points$y_ending_pts)
              
              min_x<-min(Points$time)
              max_x<-max(obs_tumor_tibble$time)
              
              ggplot()+
                geom_rect(aes(xmin=min(obs_tumor_tibble$time),
                          xmax=max(obs_tumor_tibble$time),
                          ymin=min_y-abs(max_y-min_y)/10,
                          ymax=max_y+abs(max_y-min_y)/10),
                          fill="#EFECE6")+
              geom_segment(data=segments%>%
                             dplyr::select(arc,x,x_end,y_end),
                           aes(x = x,y=y_end,xend = x_end,yend = y_end,group = arc)
              )+
                geom_segment(data=segments%>%
                               dplyr::select(arc,x,y,y_end),
                             aes(x = x,y=y,xend = x,yend = y_end,group = arc)
                )+
                  
                geom_point(data=Points,
                           aes(x=time,
                               y=y_ending_pts,
                               fill=as.factor(functional_effect)),
                           shape = 21,size = 10)+
                geom_text(dat=Points,
                          aes(x=time,
                              y=y_ending_pts,
                              label=node),size = 3
                )+
                geom_text(aes(x=max_x,
                               y=max_y+abs(max_y-min_y)/10,
                               label="Time of the simulation"),
                           hjust=1,vjust=0,color="#BFB39B")+
                ylim(min_y-abs(max_y-min_y)/10,max_y+abs(max_y-min_y)/10)+
                xlim(min_x-abs(max_x-min_x)/10,max_x+abs(max_x-min_x)/10)+
                guides(fill=guide_legend(title="Functional Effect",
                                         override.aes = list(size = 8)))+
                scale_fill_manual(values=palette)+
                theme_void()+
                theme(legend.title = element_text(size=10),
                      legend.text = element_text(size=8),
                      legend.position ="bottom",
                      legend.box = "vertical"
                      )
            },
            error=function(cond) {
              message(conditionMessage(cond))
              
              ggplot() +
                annotate("text",
                         x = 1,
                         y = 1,
                         label = "Error in the tree plot",
                         size = 6,
                         fontface = "bold") +
                theme_void()
            })
          })

setGeneric("get_muller_plot_show",function(obs_Pop_ID,obs_tumor_tibble,functional_effects,freq,palette) standardGeneric("get_muller_plot_show"))
setMethod("get_muller_plot_show",
          signature(obs_Pop_ID="tbl",
                    obs_tumor_tibble="tbl",
                    functional_effects="vector",
                    freq="logical",
                    palette="vector"),
          function(obs_Pop_ID,obs_tumor_tibble,functional_effects,freq,palette){
            
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
                paste(names(functional_effects[p@phenotype]),collapse = "_")
                })
              
              palette<-palette[sort(unique(fun_eff))]
              
              palette_light<-lighten(palette,amount = 0.1)
              names(palette_light)<-names(palette)
              palette_dark<-darken(palette,amount = 0.3)
              names(palette_dark)<-names(palette)
              
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
                    obs_tumor_tibble%>%
                      filter(Population_ID%in%root)%>%
                      group_by(time)%>%
                      summarize(clone="0",
                              Ncells_clone=sum(Ncells),
                              fun_eff=NA),
                    obs_tumor_tibble_clones)
                  pop_with_sons<-c("0",n_sons$Population_ID[n_sons$n>0])
                  daughters_ordered<-append(list(root),daughters_ordered)
                  daughters_ordered_tbl<-bind_rows(tibble(Population_ID="0",
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
                  filter(clone!="0")
                
                trasl<-min(Clones_df$y_lower)
                Clones_df$y_lower<-Clones_df$y_lower-trasl
                Clones_df$y_upper<-Clones_df$y_upper-trasl
                Clones_df$time<-as.numeric(Clones_df$time)
                Clones_df$clone<-factor(Clones_df$clone,levels=Pop_ID)
                
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
                    panel.margin = unit(0,"null"),
                    plot.margin = rep(unit(0,"null"),4),
                    axis.ticks.length = unit(0,"cm"),
                    axis.ticks.margin = unit(0,"cm")
                  )
                
                
                return(p)
                  
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
                    tibble(clone="0",
                           time=unique(obs_tumor_tibble_clones$time),
                           Fcells_clone=1,
                           fun_eff="competition"),
                    obs_tumor_tibble_clones)
                  pop_with_sons<-c("0",n_sons$Population_ID[n_sons$n>0])
                  daughters_ordered<-append(list(root),daughters_ordered)
                  daughters_ordered_tbl<-bind_rows(tibble(Population_ID="0",
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
                  filter(clone!="0")
                Clones_df$y_lower_frac<-Clones_df$y_lower_frac+0.5
                Clones_df$y_upper_frac<-Clones_df$y_upper_frac+0.5
                Clones_df$clone<-factor(Clones_df$clone,levels=Pop_ID)
                Clones_df$time<-as.numeric(Clones_df$time)
                
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
                    panel.margin = unit(0,"null"),
                    plot.margin = rep(unit(0,"null"),4),
                    axis.ticks.length = unit(0,"cm"),
                    axis.ticks.margin = unit(0,"cm")
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

setGeneric("get_muller_plot_download",function(obs_Pop_ID,obs_tumor_tibble,functional_effects,freq,palette) standardGeneric("get_muller_plot_download"))
setMethod("get_muller_plot_download",
          signature(obs_Pop_ID="tbl",
                    obs_tumor_tibble="tbl",
                    functional_effects="vector",
                    freq="logical",
                    palette="vector"),
          function(obs_Pop_ID,obs_tumor_tibble,functional_effects,freq,palette){
            
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
                paste(names(functional_effects[p@phenotype]),collapse = "_")
              })
              
              palette<-palette[sort(unique(fun_eff))]
              
              palette_light<-lighten(palette,amount = 0.4)
              names(palette_light)<-names(palette)
              palette_dark<-darken(palette,amount = 0.3)
              names(palette_dark)<-names(palette)
              
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
                    obs_tumor_tibble%>%
                      filter(Population_ID%in%root)%>%
                      group_by(time)%>%
                      summarize(clone="0",
                                Ncells_clone=sum(Ncells),
                                fun_eff=NA),
                    obs_tumor_tibble_clones)
                  pop_with_sons<-c("0",n_sons$Population_ID[n_sons$n>0])
                  daughters_ordered<-append(list(root),daughters_ordered)
                  daughters_ordered_tbl<-bind_rows(tibble(Population_ID="0",
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
                  filter(clone!="0")
                
                trasl<-min(Clones_df$y_lower)
                Clones_df$y_lower<-Clones_df$y_lower-trasl
                Clones_df$y_upper<-Clones_df$y_upper-trasl
                Clones_df$time<-as.numeric(Clones_df$time)
                Clones_df$clone<-factor(Clones_df$clone,levels=Pop_ID)
                
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
                    tibble(clone="0",
                           time=unique(obs_tumor_tibble_clones$time),
                           Fcells_clone=1,
                           fun_eff="competition"),
                    obs_tumor_tibble_clones)
                  pop_with_sons<-c("0",n_sons$Population_ID[n_sons$n>0])
                  daughters_ordered<-append(list(root),daughters_ordered)
                  daughters_ordered_tbl<-bind_rows(tibble(Population_ID="0",
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
                  filter(clone!="0")
                Clones_df$y_lower_frac<-Clones_df$y_lower_frac+0.5
                Clones_df$y_upper_frac<-Clones_df$y_upper_frac+0.5
                Clones_df$clone<-factor(Clones_df$clone,levels=Pop_ID)
                Clones_df$time<-as.numeric(Clones_df$time)
                
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
