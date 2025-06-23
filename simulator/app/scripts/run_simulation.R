source("/app/scripts/libraries.R")
source("/app/scripts/inport_par.R")
source("/app/scripts/Utils.R")
source("/app/scripts/Population.R")
source("/app/scripts/Local_Params.R")
source("/app/scripts/Population_with_size_nmut.R")
source("/app/scripts/Simulazioni_fenotipo_classi.R")



load("/data/Parameters.RData")
path<-"/data"
Nexp<-1

simulazione(Nexp=Nexp,
            path = path,
            starting_gen = starting_gen,
            starting_fun_eff=starting_fun_eff,
            tmax=tmax,
            Ncellsmax = NULL,
            Ncells_start = Ncells_start,
            parameters = parameters)

