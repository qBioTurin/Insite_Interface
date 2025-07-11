source("scripts/libraries.R")
source("scripts/Utils.R")
source("scripts/Population.R")
source("scripts/Local_Params.R")
source("scripts/Population_with_size_nmut.R")

args<-commandArgs(trailingOnly = TRUE)
if(interactive()){
  args <- c("raw",20,"output")
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

all_mut<-unique(unlist(unique_mut_id))
used_nums<-as.numeric(gsub(pattern = "Mut",x = names(mut_names),replacement = ""))
mut_nums<-1:length(all_mut)
not_used_mut_nums<-mut_nums[!mut_nums%in%used_nums]
mut_names_tbl<-tibble(mut=c(mut_names,all_mut[!all_mut%in%mut_names]),
                      names=c(names(mut_names),paste0("Mut",not_used_mut_nums,sep="",recycle0 = TRUE)))

save(mut_names_tbl,file=paste(path_in,"mut_names_tbl.RData",sep="/"))
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
  arrange(desc(frequency))%>%
  merge(mut_names_tbl)

write(toJSON(composition%>%dplyr::select(fun_eff,frequency)
),file = paste(path_in,"seq_hist_df.json",sep="/"))

roots<-composition$mut[is.na(composition$parents)]

if(length(roots)>1){
  composition<-composition%>%
    mutate(parents=ifelse(is.na(parents),"0",parents))%>%
    bind_rows(tibble(mut="0"))
}

p<-get_tree_plot_app(composition,palette)

p
ggsave(p,device = "png",
       path = path_out,
       filename="plot_tree_sequenced.png")


table_pops<-tibble(pop_id=1:length(pop),mut=unique_mut_id,fun_eff)%>%
  unnest(c(mut,fun_eff))%>%
  merge(mut_names_tbl)%>%
  group_by(pop_id)%>%
  summarise(
    mut_names=list(names),
    fun_eff=list(fun_eff),
  )%>%
  bind_cols(tibble(ncells,nmut=lengths(gen)))%>%
  arrange(desc(ncells))%>%
  group_by(nmut)%>%
  summarise(pop_names=list(mut_names),fun_eff=list(fun_eff),ncells=list(ncells))

write(jsonlite::toJSON(table_pops,auto_unbox = FALSE),file = paste(path_out,"table_pops.json",sep="/"))
