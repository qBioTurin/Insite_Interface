source("libraries.R")
source("Utils.R")
source("Population.R")
source("Local_Params.R")
source("Population_with_size_nmut.R")

load("/data/Parameters.RData")
path<-"/data"
Nexp<-1

filenames <- list.files(paste(path,"/sim",Nexp,sep=""), full.names = FALSE)

tumor<-lapply(filenames,function(filename){
  load(paste(path,"/sim",Nexp,"/",filename,sep=""))
  name<-stringr::str_replace(filename,"Zprovv","")
  name<-stringr::str_replace(name,".RData","")
  setNames(object = list(Zprovv), name)
})
tumor<-unlist(tumor,recursive = FALSE)
tumor<-tumor[order(as.numeric(names(tumor)))]

obs_tumor<-get_obs_tumor(parameters,tumor,10^(-3))
plot<-get_my_muller_plot(obs_Pop_ID = obs_tumor$obs_Pop_ID,
                         obs_tumor_tibble = obs_tumor$obs_tumor_tibble,
                         functional_effects = parameters@functional_effects,
                         freq = FALSE,
                         palette = c(1))

ggsave(plot,device = "png",
       path = "/data/",width = 9,height = 5,
       filename="plot.png",)
