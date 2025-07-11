source("scripts/install_libraries.R")
source("scripts/libraries.R")
source("scripts/inport_par.R")
source("scripts/Utils.R")
source("scripts/Population.R")
source("scripts/Local_Params.R")
source("scripts/Population_with_size_nmut.R")
source("scripts/Simulazioni_fenotipo_classi.R")

args<-commandArgs(trailingOnly = TRUE)
if(interactive()){
  args <- c("params.json","raw")
}

json_data <- fromJSON(file=args[1])
path<-args[2]
if(length(args)==2){
  runif(1)
  seed_selected<-as.integer(Sys.time())
}else{
  seed_selected<- args[3]
}

load(paste(path,"/Parameters.RData",sep=""))
Nexp<-1

simulazione(Nexp=Nexp,
            seed=seed_selected,
            path = path,
            starting_gen = starting_gen,
            starting_fun_eff=starting_fun_eff,
            tmax=tmax,
            Ncellsmax = NULL,
            Ncells_start = Ncells_start,
            parameters = parameters)

