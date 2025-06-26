source("scripts/libraries.R")
source("scripts/Utils.R")
source("scripts/Population.R")
source("scripts/Local_Params.R")
source("scripts/Population_with_size_nmut.R")

args<-commandArgs(trailingOnly = TRUE)
if(interactive()){
  args <- c("raw","raw/labeled_colors.json","output")
}
path_in<-args[1]
path_out<-args[3]
json_palette_file<-args[2]

load(paste(path_in,"/obs_tumor.RData",sep=""))
load(paste(path_in,"/Parameters.RData",sep=""))
json_palette<-fromJSON(file=json_palette_file)
palette<-sapply(json_palette,function(el){el$color})
names(palette)<-sapply(json_palette,function(el){el$label})


plot_show_absolute<-get_muller_plot_show(obs_Pop_ID = obs_tumor$obs_Pop_ID,
                                obs_tumor_tibble = obs_tumor$obs_tumor_tibble,
                                freq = FALSE,
                                palette = palette,
                                functional_effects = parameters@functional_effects)

ggsave(plot_show_absolute,device = "png",
       path = path_out,
       width = 9,height = 5,
       filename="plot_show_absolute.png")

side_plot_show<-get_side_plot_show(obs_tumor$obs_tumor_tibble)+
  theme(plot.margin =  unit(c(-17.5,-33,-17.5,-33), "pt"))

ggsave(side_plot_show,device = "png",
       path = path_out,
       width = 1,height = 5,
       filename="side_plot_show.png")

plot_show_relative<-get_muller_plot_show(obs_Pop_ID = obs_tumor$obs_Pop_ID,
                                         obs_tumor_tibble = obs_tumor$obs_tumor_tibble,
                                         freq = TRUE,
                                         palette = palette,
                                         functional_effects = parameters@functional_effects)

ggsave(plot_show_relative,device = "png",
       path = path_out,
       width = 9,height = 5,
       filename="plot_show_relative.png")

plot_download_absolute<-get_muller_plot_download(obs_Pop_ID = obs_tumor$obs_Pop_ID,
                                obs_tumor_tibble = obs_tumor$obs_tumor_tibble,
                                freq = FALSE,
                                palette = palette,
                                functional_effects = parameters@functional_effects)

ggsave(plot_download_absolute,device = "pdf",
       path = path_out,
       width = 9,height = 5,
       filename="plot_download_absolute.pdf")

plot_download_relative<-get_muller_plot_download(obs_Pop_ID = obs_tumor$obs_Pop_ID,
                                                 obs_tumor_tibble = obs_tumor$obs_tumor_tibble,
                                                 freq = TRUE,
                                                 palette = palette,
                                                 functional_effects = parameters@functional_effects)

ggsave(plot_download_relative,device = "pdf",
       path = path_out,
       width = 9,height = 5,
       filename="plot_download_relative.pdf")
