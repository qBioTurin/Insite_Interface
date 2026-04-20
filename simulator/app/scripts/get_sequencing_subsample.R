library(Insite)
library(stringr)
library(ggplot2)
if (!require("optparse")) {
  install.packages("optparse",repos = "https://cloud.r-project.org")
  library(rjson)
}
if (!require("rjson")) {
  install.packages("rjson",repos = "https://cloud.r-project.org")
  library(rjson)
}

option_list<-list(
  make_option(
    c("--sim_dir"),
    type="character",
    default = "raw/sim1",
    help = "path to the folder in which the simulation outputs is stored"
  ),
  make_option(
    c("--params"),
    type="character",
    default = "raw/Parameters.RData",
    help = "path of the .RData file with the elaborated parameters"
  ),
  make_option(
    c("--path_out"),
    type="character",
    default = "raw",
    help = "folder in which the output plot files are stored"
  ),
  make_option(
    c("--num_seq"),
    type="numeric",
    default = Inf,
    help = "simulation step to be sequenced"
  ),
  make_option(
    c("--plot_data"),
    type="character",
    default = "output/Clones_df_absolute.RData",
    help = "path to the .RData file with the dataset to build the figure"
  ),
  make_option(
    c("--neighborhood"),
    type="character",
    default = NULL,
    help = "If the neighborhood for the simulation has already been computed, indicate here the path to the file (default name Clones_ordered_day.RData).
    The most expensive part of the sequencing is the computation of these neighborhood, which once done is not required for repeating the sequencing"
  ),
  make_option(
    c("--json_palette_file"),
    type="character",
    default = "raw/label_color.json",
    help = "json file with colors for populations (path)"
  ),
  make_option(
    c("--mut_names_tbl"),
    type="character",
    default = "output/mut_names_tbl.RData",
    help = "path to the .RData file with the mutation names to be used in the sequencing"
  )
)

opt_parser<-OptionParser(option_list = option_list)
opt<-parse_args(opt_parser)

path_sim <- opt$sim_dir
path_params <- opt$params
path_out <- opt$path_out
seq_day<-opt$num_seq
Clones_ordered_path<-opt$neighborhood
path_plot_data<-opt$plot_data
path_mut_names_tbl<-opt$mut_names_tbl
json_palette_file<-opt$json_palette_file

load(path_params)

sim_files <- list.files(path_sim)
sim_files <- sim_files[grepl("Zprovv", sim_files)]

index_files <- as.numeric(str_remove(str_remove(sim_files, "Zprovv"), ".RData"))

if (seq_day == Inf) {
  Zprovv_file <- sim_files[which.max(index_files)]
} else {
  Zprovv_file <- sim_files[
    index_files == which.min(abs(parameters@print_time - seq_day))
  ]
}

load(file.path(path_sim, Zprovv_file))
ncells<-sapply(Zprovv,Ncells)

n_seq_cells<-round(0.1*sum(ncells))
if(n_seq_cells<1){n_seq_cells<-sum(ncells)}

if(is.null(Clones_ordered_path)){
  Clones_df<-Insite:::get_ordered_clones_sequencing(Zprovv)
  save(Clones_df,file = paste0(path_out,"/Clones_ordered_",seq_day,".RData"))
}else{
  load(Clones_ordered_path)
}

vcf_list <- sequencing(
  Zprovv = Zprovv,
  Clones_df = Clones_df,
  parameters = parameters,
  n_regions = 1,
  n_seq_cells = n_seq_cells,
  Nrep = 1
)

write(jsonlite::toJSON(vcf_list[[1]][[1]],auto_unbox = FALSE),file=paste(path_out,"vcf_sampled.json",sep="/"))

load(path_plot_data)

seq_min_y<-vcf_list[[1]][[2]]
seq_max_y<-seq_min_y+n_seq_cells
range_plot_zoom_x<-unique(Clones_df_absolute$time)[which(sort(unique(Clones_df_absolute$time))==time_provv)+c(-1,1)]
range_plot_zoom_y<-c(min(Clones_df_absolute$y_lower[Clones_df_absolute$time==time_provv]),
                     max(Clones_df_absolute$y_upper[Clones_df_absolute$time==time_provv]))
xmin_rect<-time_provv-diff(range_plot_zoom_x)/50
xmax_rect<-time_provv+diff(range_plot_zoom_x)/50
y_trasl<-min(Clones_df_absolute$y_lower[Clones_df_absolute$time==time_provv])

json_palette<-fromJSON(file=json_palette_file)
palette<-sapply(json_palette,function(el){el$color})
if(all(palette=="")){
  hues <- seq(0, 360, length.out = length(palette) + 1)[-1]  
  palette <- hsv(h = hues / 360, s = 0.7, v = 0.9)  
}
names(palette)<-sapply(json_palette,function(el){el$label})

p<-plot_show_absolute+
  coord_cartesian(xlim =range_plot_zoom_x,
                  ylim = range_plot_zoom_y)+
  scale_fill_manual(values=palette)+
  geom_vline(xintercept = time_provv,color="white",alpha=0.4)+
  geom_rect(aes(xmin = xmin_rect,
                xmax = xmax_rect,
                ymin = seq_min_y+y_trasl,
                ymax=seq_max_y+y_trasl),
            fill="transparent",
            color="black",
            linetype = 2,
            linewidth = 0.5)
ggsave(plot=p,filename = "zoom_sequence_plot.png",device = "png",width = 5,height = 5,path = path_out)
