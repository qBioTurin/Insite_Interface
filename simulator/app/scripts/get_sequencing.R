source("scripts/libraries.R")
source("scripts/Utils.R")
source("scripts/Population.R")
source("scripts/Local_Params.R")
source("scripts/Population_with_size_nmut.R")

args<-commandArgs(trailingOnly = TRUE)
if(interactive()){
  args <- c("raw",31)
}
path<-args[1]

load(paste(path,"/Parameters.RData",sep=""))

num_seq<-as.numeric(args[2])
Nexp<-1

load(paste(path,"/sim",Nexp,"/Zprovv",num_seq,".RData",sep=""))

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

write(toJSON(pop_nmut),file = paste(path,"seq_barplot_df.json",sep="/"))

ggplot(pop_nmut)+
  geom_col(aes(x=names(ncells),y=ncells))
ggplot(pop_nmut)+
  geom_col(aes(x=names(npop),y=as.numeric(npop)))

# starting_muts<-sapply(starting_gen, function(g){
#   starting_mut<-vector()
#   for(i in 1:length(g)){
#     starting_mut<-c(starting_mut,paste(g[1:i],collapse="_"))
#   }
#   return(starting_mut)
# })%>%unlist()%>%unique()

parent<-lapply(unique_mut_id,lag)
mut_generation<-sapply(gen, function(g){1:length(g)})
composition<-tibble(mut=unique_mut_id,parent,fun_eff,ncells,mut_generation)%>%
  unnest(c(mut,parent,fun_eff,mut_generation))%>%
  group_by(mut,parent,fun_eff,mut_generation)%>%
  summarise(ncells=sum(ncells),
            frequency=ncells/tot_ncells)%>%
  ungroup()%>%
  arrange(desc(frequency))


write(toJSON(composition%>%dplyr::select(fun_eff,frequency)
),file = paste(path,"seq_hist_df.json",sep="/"))

ggplot(composition)+
  geom_histogram(aes(x=frequency))


{sampled_ncells<-as.vector(rmultinom(1,round(tot_ncells/100),ncells/tot_ncells))
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

