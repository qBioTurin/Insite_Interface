source("scripts/libraries.R")
source("scripts/Utils.R")
source("scripts/Population.R")
source("scripts/Local_Params.R")
source("scripts/Population_with_size_nmut.R")

args<-commandArgs(trailingOnly = TRUE)
if(interactive()){
  args <- c("raw",FALSE,"label_color.json","output")
}
path_in<-args[1]
path_out<-args[4]
json_palette_file<-args[3]
freq<-args[2]

load(paste(path_in,"/obs_tumor.RData",sep=""))
load(paste(path_in,"/Parameters.RData",sep=""))
json_palette<-fromJSON(file=json_palette_file)
palette<-sapply(json_palette,function(el){el$color})
names(palette)<-sapply(json_palette,function(el){el$label})

plot_show<-get_muller_plot_show(obs_Pop_ID = obs_tumor$obs_Pop_ID,obs_tumor_tibble = obs_tumor$obs_tumor_tibble,freq = freq,palette = palette)
  
ggsave(plot,device = "png",
       path = path_out,
       width = 9,height = 5,
       filename="plot.png")
