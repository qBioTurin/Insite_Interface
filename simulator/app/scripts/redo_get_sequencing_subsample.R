source("scripts/libraries.R")
source("scripts/Utils.R")
source("scripts/Population.R")
source("scripts/Local_Params.R")
source("scripts/Population_with_size_nmut.R")

args<-commandArgs(trailingOnly = TRUE)
if(interactive()){
  args <- c("raw",16,"output")
}
path_in<-args[1]
path_out<-args[3]

load(paste(path_in,"/Parameters.RData",sep=""))
load(paste(path_in,"mut_names_tbl.RData",sep="/"))

num_seq<-as.numeric(args[2])
Nexp<-1

load(paste(path_in,"/sim",Nexp,"/Zprovv",num_seq,".RData",sep=""))

pop<-lapply(Zprovv,Population)
Pop_ID<-1:length(pop)
ncells<-sapply(Zprovv,Ncells)

gen<-lapply(pop,genotype)
fun_eff<-lapply(pop,functional_effect)
fun_eff_label<-lapply(fun_eff,function(f){names(parameters@functional_effects)[f]})
unique_mut_id<-lapply(gen,function(g){
  unique_id_mut<-vector()
  for(i in 1:length(g)){
    unique_id_mut<-c(unique_id_mut,paste(g[1:i],collapse="_"))
  }
  return(unique_id_mut)
})

load(paste(path_in,"Clones_ordered_muller.RData",sep="/"))

n_seq_cells<-round(0.1*sum(ncells))
seq_min_y<-runif(1,min(Clones_df$y_lower),max(Clones_df$y_upper)-n_seq_cells)
seq_max_y<-seq_min_y+n_seq_cells

Clones_df_seq<-Clones_df%>%
  filter(y_lower<seq_max_y,y_upper>seq_min_y)%>%
  merge(tibble(clone=Pop_ID,
               mut=sapply(unique_mut_id,function(muts){muts[length(muts)]}),
               fun_eff=sapply(fun_eff_label,function(funcs){funcs[length(funcs)]})))%>%
  rowwise()%>%
  mutate(Ncells_seq=round(min(y_upper,seq_max_y)-max(y_lower,seq_min_y)),
         prob=Ncells_seq/(2*(seq_max_y-seq_min_y)))%>%
  ungroup()%>%
  dplyr::select(mut,fun_eff,Ncells_seq,prob)

load("dens.RData")

sample_DP<-round(sample(x = dens_coverage$x, nrow(Clones_df_seq), prob = dens_coverage$y, replace=TRUE) + rnorm(1, 0, dens_coverage$bw))
sample_DP[sample_DP<0]<-0
sample_AD<-mapply(rbinom,prob=Clones_df_seq$prob,size=sample_DP,MoreArgs = list(n=1))

vcf_sample<-Clones_df_seq%>%
  bind_cols(sample_DP=sample_DP,sample_AD=sample_AD)%>%
  filter(sample_AD>0)%>%
  mutate(VAF=sample_AD/sample_DP)%>%
  merge(mut_names_tbl)%>%
  dplyr::select(-c(prob,Ncells_seq,mut))%>%
  rename("mut"="names")



write(jsonlite::toJSON(vcf_sample,auto_unbox = FALSE),file=paste(path_out,"vcf_sampled.json",sep="/"))

load(paste(path_in,"Clones_df_absolute.RData",sep="/"))

range_plot_zoom_x<-unique(Clones_df_absolute$time)[which(sort(unique(Clones_df_absolute$time))==time_provv)+c(-1,1)]
range_plot_zoom_y<-c(min(Clones_df_absolute$y_lower[Clones_df_absolute$time==time_provv]),
                     max(Clones_df_absolute$y_upper[Clones_df_absolute$time==time_provv]))
xmin_rect<-time_provv-diff(range_plot_zoom_x)/50
xmax_rect<-time_provv+diff(range_plot_zoom_x)/50
y_trasl<-min(Clones_df_absolute$y_lower[Clones_df_absolute$time==time_provv])

p<-plot_show_absolute+
  coord_cartesian(xlim =range_plot_zoom_x,
                  ylim = range_plot_zoom_y)+
  geom_vline(xintercept = time_provv,color="white",alpha=0.4)+
  geom_rect(aes(xmin = xmin_rect,
                xmax = xmax_rect,
                ymin = seq_min_y+y_trasl,
                ymax=seq_max_y+y_trasl),
            fill="transparent",
            color="black",
            linetype = 2,
            linewidth = 0.5)
p
vcf_sample

ggsave(plot=p,filename = "zoom_sequence_plot.png",device = "png",width = 5,height = 5,path = path_out)
