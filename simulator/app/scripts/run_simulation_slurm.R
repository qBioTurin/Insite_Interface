source("scripts/install_libraries.R")
source("scripts/libraries.R")
source("scripts/Utils.R")
source("scripts/Population.R")
source("scripts/Local_Params.R")
source("scripts/Population_with_size_nmut.R")
source("scripts/Simulazioni_fenotipo_classi.R")

option_list<-list(
  make_option(
    c("--seed"),
    type="integer",
    default = as.integer(Sys.time()),
    help = "Seed for the first simulation"
  ),
  make_option(
    c("--params_RData"),
    type="character",
    default = "Parameters.RData",
    help = "RData file created by import_par_slurm"
  ),
  make_option(
    c("--dir"),
    type="character",
    default = "raw",
    help = "directory for the files"
  )
)

opt_parser<-OptionParser(option_list = option_list)
opt<-parse_args(opt_parser)

path<-opt$dir
params_RData<-opt$params_RData

load(paste(path,"/Parameters.RData",sep=""))

simulazione(Nexp=1,
            seed=opt$seed,
            path = path,
            starting_gen = starting_gen,
            starting_fun_eff=starting_fun_eff,
            tmax=tmax,
            Ncellsmax = NULL,
            Ncells_start = Ncells_start,
            parameters = parameters)

