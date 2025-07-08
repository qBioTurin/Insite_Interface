source("scripts/libraries.R")
source("scripts/Utils.R")
source("scripts/Population.R")
source("scripts/Local_Params.R")
source("scripts/Population_with_size_nmut.R")

args<-commandArgs(trailingOnly = TRUE)
if(interactive()){
  args <- c("raw",27,"output")
}
path_in<-args[1]
path_out<-args[3]

load(paste(path_in,"/Parameters.RData",sep=""))

num_seq<-as.numeric(args[2])
Nexp<-1

load(paste(path_in,"/sim",Nexp,"/Zprovv",num_seq,".RData",sep=""))

pop<-lapply(Zprovv,Population)
gen<-lapply(pop,genotype)
fun_eff_num<-lapply(pop,functional_effect)
fun_eff<-lapply(fun_eff_num,function(n){names(parameters@functional_effects)[n]})
ncells<-sapply(Zprovv,Ncells)
tot_ncells<-sum(ncells)
unique_mut_id<-lapply(gen,function(g){
  unique_id_mut<-vector()
  for(i in 1:length(g)){
    unique_id_mut<-c(unique_id_mut,paste(g[1:i],collapse="_"))
  }
  return(unique_id_mut)
})
nmut_in_gen<-lengths(gen)

pop_nmut<-tibble(ncells=sapply(split(ncells,nmut_in_gen), sum),
       npop=table(nmut_in_gen))

write(toJSON(pop_nmut),file = paste(path_in,"seq_barplot_df.json",sep="/"))

parents<-lapply(unique_mut_id,lag)
mut_generation<-sapply(gen, function(g){1:length(g)})
composition<-tibble(mut=unique_mut_id,parents,fun_eff,ncells,mut_generation)%>%
  unnest(c(mut,parents,fun_eff,mut_generation))%>%
  group_by(mut,parents,fun_eff,mut_generation)%>%
  summarise(ncells=sum(ncells),
            frequency=ncells/tot_ncells)%>%
  ungroup()%>%
  arrange(desc(frequency))

write(toJSON(composition%>%dplyr::select(fun_eff,frequency)
),file = paste(path_in,"seq_hist_df.json",sep="/"))

roots<-composition$mut[is.na(composition$parents)]

if(length(roots)>1){
  composition<-composition%>%
    mutate(parents=ifelse(is.na(parents),"0",parents))%>%
    bind_rows(tibble(mut="0"))
}

p<-get_tree_plot_app(composition)

p
ggsave(p,device = "pdf",
       path = path_out,
       filename="plot_tree_sequenced.pdf")


tibble(unique_mut_id,ncells,nmut_in_gen)%>%
  group_split(nmut_in_gen)%>%
  lapply(function(t){
    t%>%
      mutate(id_pop=row_number())%>%
      unnest("unique_mut_id")%>%
      merge(composition%>%dplyr::select(mut,fun_eff),by.x = "unique_mut_id",by.y = "mut")
  })

# lapply(split(unique_mut_id[order(ncells,decreasing = TRUE)],
#       nmut_in_gen[order(ncells,decreasing = TRUE)]),
#       function(l){
#         l_ord<-l[order(
#           sapply(l,
#                  function(p){
#                    return(sum(p%in%wanted_mut))
#                    }),
#           decreasing=TRUE
#           )]
#         return(l_ord[1:min(5,length(l_ord))])
#       })

options(pillar.sigfig=10)
obs_Pop_ID<-tibble(Population_ID=1:length(pop),Populations=pop)
obs_tumor_tibble<-tibble(time=time_provv,Population_ID=1:length(pop),Ncells=ncells)

Pop_ID<-obs_Pop_ID$Population_ID

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

#fun_eff<-sapply(pop,function(p){
#  paste(names(functional_effects[sort(p@phenotype)]),collapse = ", ")
#})

daughters_tbl<-bind_cols(obs_Pop_ID,tibble(daughters=daughters))
obs_tumor_tibble<-obs_tumor_tibble%>%
  group_by(time)%>%
  mutate(
    Fcells=Ncells/tot_ncells)

obs_tumor_tibble_clones<-tibble(Population_ID=Pop_ID,ancestors)%>%
  unnest(ancestors)%>%
  full_join(obs_tumor_tibble)%>%
  group_by(ancestors,time)%>%
  mutate(Fcells_clone=sum(Fcells))%>%
  ungroup()%>%
  dplyr::select(ancestors,time,Fcells_clone)%>%
  distinct()%>%
  rename("clone"="ancestors")%>%
  left_join(tibble(clone=Pop_ID))

root<-unlist(ancestors[lengths(ancestors)==1])
pop_with_sons<-n_sons$Population_ID[n_sons$n>0]

if(length(root)>1){
  obs_tumor_tibble_clones<-bind_rows(
    tibble(clone=0,
           time=unique(obs_tumor_tibble_clones$time),
           Fcells_clone=1),
    obs_tumor_tibble_clones)
  pop_with_sons<-c(0,n_sons$Population_ID[n_sons$n>0])
  daughters<-append(list(root),daughters)
  daughters_tbl<-bind_rows(tibble(Population_ID=0,
                                  daughters=list(root)),daughters_tbl)
  root<-0
}

Clones_df<-obs_tumor_tibble_clones%>%
  filter(clone==root)%>%
  mutate(y_lower_frac=-Fcells_clone/2,
         y_upper_frac=Fcells_clone/2)

for(p in pop_with_sons){
  daughters_p<-daughters_tbl$daughters[daughters_tbl$Population_ID==p][[1]]
  n_siblings_d<-length(daughters_p)
  
  for(d in daughters_p){
    sibling_number<-which(daughters_p==d)
    older_siblings<-daughters_p[0:(sibling_number-1)]
    
    prop_y_start<-sibling_number/(n_siblings_d+1)
    
    #time_appearance_d<-time_of_appearance$time_of_appearance[time_of_appearance$Population_ID==d]
    
    #Fcells_parent_appearance<-obs_tumor_tibble$Fcells[obs_tumor_tibble$Population_ID==p&
                                                     #   obs_tumor_tibble$time==time_appearance_d]
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
      dplyr::select(time,clone,Fcells_clone,y_lower_frac,y_upper_frac)
    Clones_df<-rbind(Clones_df,d_df)
  }
}

Clones_df<-Clones_df%>%
  filter(clone!=0)
Clones_df$y_lower_frac<-Clones_df$y_lower_frac+0.5
Clones_df$y_upper_frac<-Clones_df$y_upper_frac+0.5
Clones_df$clone<-factor(Clones_df$clone,levels=Pop_ID)
Clones_df$time<-as.numeric(Clones_df$time)

Clones_df<-distinct(Clones_df)

f_seq_cells<-0.01
seq_min_y<-runif(1,0,1-f_seq_cells)
seq_max_y<-seq_min_y+f_seq_cells


Clones_df_seq<-Clones_df%>%
  filter(y_lower_frac<seq_max_y,y_upper_frac>seq_min_y)

mut_seq<-Clones_df_seq%>%
  rename("Population_ID"="clone")%>%
  merge(obs_Pop_ID)%>%
  pull(Populations)%>%
  sapply(function(p){
    g<-genotype(p)
      unique_id_mut<-vector()
      for(i in 1:length(g)){
        unique_id_mut<-c(unique_id_mut,paste(g[1:i],collapse="_"))
      }
      return(unique_id_mut[length(unique_id_mut)])
  })

VAF_mut_seq<-Clones_df_seq%>%
  rowwise()%>%
  mutate(VAF=(min(y_upper_frac,seq_max_y)-max(y_lower_frac,seq_min_y))/f_seq_cells)%>%pull(VAF)
tibble(mut_seq,VAF_mut_seq)

{
  sampled_ncells<-as.vector(rmultinom(1,round(tot_ncells/100),ncells/tot_ncells))
tot_sampled_cells<-sum(sampled_ncells)

pcr<-function(ncells_start,ncycles){
  ncells<-ncells_start
  for(i in 1:ncycles){
    num_dupl<-rbinom(1,ncells,0.85)
    ncells<-num_dupl*2+(ncells-num_dupl)
  }
  return(ncells)
}

sampled_cells_info<-tibble(gen,fun_eff,id_pop=1:length(gen),mut=unique_mut_id,sampled_ncells)%>%
  filter(sampled_ncells>0)%>%
  rowwise()%>%
  mutate(ncells_post_PCR=pcr(sampled_ncells,10))%>%
  ungroup()%>%
  mutate(tot_ncells_post_PCR=sum(ncells_post_PCR))%>%
  unnest(c(mut,fun_eff))%>%
  group_by(mut,fun_eff)%>%
  mutate(ncells=sum(ncells_post_PCR),
         prob=ncells/(2*tot_ncells_post_PCR))%>%
  dplyr::select(mut,fun_eff,ncells,prob)%>%
  distinct()

load("dens.RData")


sample_DP<-round(sample(x = dens_coverage$x, nrow(sampled_cells_info), prob = dens_coverage$y, replace=TRUE) + rnorm(1, 0, dens_coverage$bw))
sample_DP[sample_DP<0]<-0
sample_AD<-mapply(rbinom,prob=sampled_cells_info$prob,size=sample_DP,MoreArgs = list(n=1))
vcf_sample<-sampled_cells_info%>%
  bind_cols(sample_DP=sample_DP,sample_AD=sample_AD)%>%
  filter(sample_AD>0)%>%
  mutate(VAF=sample_AD/sample_DP)%>%
  dplyr::select(-c(prob,ncells))

vcf_sample}

