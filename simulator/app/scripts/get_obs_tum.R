source("scripts/libraries.R")
source("scripts/Utils.R")
source("scripts/Population.R")
source("scripts/Local_Params.R")
source("scripts/Population_with_size_nmut.R")

args<-commandArgs(trailingOnly = TRUE)
if(interactive()){
  args <- c("raw",4)
}
path<-args[1]
depth<-10^{-as.numeric(args[2])}

load(paste(path,"/Parameters.RData",sep=""))
Nexp<-1

filenames <- list.files(paste(path,"/sim",Nexp,sep=""), full.names = FALSE)

tumor<-lapply(filenames,function(filename){
  load(paste(path,"/sim",Nexp,"/",filename,sep=""))
  
  #name<-stringr::str_replace(filename,"Zprovv","")
  #name<-stringr::str_replace(name,".RData","")
  setNames(object = list(Zprovv), time_provv)
})
tumor<-unlist(tumor,recursive = FALSE)
tumor<-tumor[order(as.numeric(names(tumor)))]

obs_pop<-unique(unlist(sapply(tumor,
                              function(tum_time_fix){
                                Ncells_time_fix<-sapply(tum_time_fix, Ncells)
                                Fcells_time_fix<-Ncells_time_fix/sum(Ncells_time_fix)
                                tum_time_fix_filt<-tum_time_fix[Fcells_time_fix>depth]
                                obs_pop<-lapply(tum_time_fix_filt,Population)
                                return(obs_pop)
                              })))




obs_pop_id<-tibble(Population_ID=1:length(obs_pop),Populations=obs_pop)

obs_tumor_tibble_timefix<-lapply(1:length(tumor),function(count){
  tum_time_fix<-tumor[[count]]
  pop_time_fix<-lapply(tum_time_fix,Population)
  obs_tumor_tibble<-tibble(
    time=as.numeric(names(tumor[count])),
    Population_ID=obs_pop_id$Population_ID,
    Ncells=0)
  for(pop_w_s_nmut in tum_time_fix){
    pop<-Population(pop_w_s_nmut)
    Ncells<-Ncells(pop_w_s_nmut)
    desc<-sapply(obs_pop,
                 is_descendant,
                 Population_younger=pop)
    
    which_assign<-which.min(sapply(obs_pop,
                                   how_old_descendant,
                                   Population_younger=pop))
    
    obs_tumor_tibble$Ncells[obs_tumor_tibble$Population_ID==which_assign]<-obs_tumor_tibble$Ncells[obs_tumor_tibble$Population_ID==which_assign]+Ncells
  }
  return(obs_tumor_tibble%>%filter(Ncells>0))
}
)
obs_tumor_tibble<-bind_rows(obs_tumor_tibble_timefix)
obs_tumor<-list()
obs_tumor$obs_tumor_tibble<-obs_tumor_tibble
obs_tumor$obs_Pop_ID<-obs_pop_id

save(obs_tumor,file = paste(path,"/obs_tumor.RData",sep=""))

obs_pop_ordered<-obs_tumor_tibble%>%
  group_by(Population_ID)%>%
  summarise(max_ncells=max(Ncells))%>%
  merge(obs_pop_id)%>%
  arrange(desc(max_ncells))%>%
  pull(Populations)

fun_eff_labels<-unique(sapply(obs_pop_ordered,
                              function(pop){
                                paste(
                                  names(
                                    parameters@functional_effects[
                                      sort(
                                        phenotype(pop)
                                      )
                                    ]
                                  ),
                                  collapse = ", ")
                              }
)
)

json_data <- lapply(fun_eff_labels,
                    function(fun_eff_label) {
                      list(label = fun_eff_label, color = "")
                    }
)

write(toJSON(
  json_data
),paste(path,"/label_color.json",sep=""))
