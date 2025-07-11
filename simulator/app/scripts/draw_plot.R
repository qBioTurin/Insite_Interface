source("scripts/libraries.R")
source("scripts/Utils.R")
source("scripts/Population.R")
source("scripts/Local_Params.R")
source("scripts/Population_with_size_nmut.R")

args<-commandArgs(trailingOnly = TRUE)
if(interactive()){
  args <- c("raw","raw/label_color.json","output")
}
path_in<-args[1]
path_out<-args[3]
json_palette_file<-args[2]

load(paste(path_in,"/obs_tumor.RData",sep=""))
load(paste(path_in,"/Parameters.RData",sep=""))
json_palette<-fromJSON(file=json_palette_file)
palette<-sapply(json_palette,function(el){el$color})
names(palette)<-sapply(json_palette,function(el){el$label})

Clones_df_absolute<-get_muller_plot_info(obs_Pop_ID = obs_tumor$obs_Pop_ID,
                     obs_tumor_tibble = obs_tumor$obs_tumor_tibble,
                     freq = FALSE,
                     functional_effects = parameters@functional_effects)

Clones_df_relative<-get_muller_plot_info(obs_Pop_ID = obs_tumor$obs_Pop_ID,
                                         obs_tumor_tibble = obs_tumor$obs_tumor_tibble,
                                         freq = TRUE,
                                         functional_effects = parameters@functional_effects)

plot_show_absolute<-get_muller_plot_show(Clones_df = Clones_df_absolute,
                                freq = FALSE,
                                palette = palette)

save(plot_show_absolute,Clones_df_absolute,file=paste(path_in,"Clones_df_absolute.RData",sep="/"))

ggsave(plot_show_absolute,device = "png",
       path = path_out,
       width = 9,height = 5,
       filename="plot_show_absolute.png")

max_size_reached<-max(obs_tumor$obs_tumor_tibble%>%group_by(time)%>%summarise(Ncells=sum(Ncells)))
little_label_k<-scales::scientific(max_size_reached, digits = 1)
little_label_k<-str_split(little_label_k,"e",simplify = TRUE)
little_label_k<-as.numeric(little_label_k)
names(little_label_k)<-c("base","exponent")

write(toJSON(little_label_k),file = paste(path_in,"little_label_k.json",sep="/"))


plot_show_relative<-get_muller_plot_show(Clones_df = Clones_df_relative,
                                         freq = TRUE,
                                         palette = palette)

ggsave(plot_show_relative,device = "png",
       path = path_out,
       width = 9,height = 5,
       filename="plot_show_relative.png")

plot_download_absolute<-get_muller_plot_download(Clones_df = Clones_df_absolute,
                                                 freq = FALSE,
                                                 palette = palette)

ggsave(plot_download_absolute,device = "pdf",
       path = path_out,
       width = 9,height = 5,
       filename="plot_download_absolute.pdf")

plot_download_relative<-get_muller_plot_download(Clones_df = Clones_df_relative,
                                                 freq = TRUE,
                                                 palette = palette)

ggsave(plot_download_relative,device = "pdf",
       path = path_out,
       width = 9,height = 5,
       filename="plot_download_relative.pdf")

