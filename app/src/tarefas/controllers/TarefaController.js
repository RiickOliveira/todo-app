(function(){

  angular
       .module('Tarefa')
       .controller('TarefaController', [
          'TarefaService', '$mdDialog',
          TarefaController
       ]);
 
  function TarefaController( TarefaService, $mdDialog) {
    const vm = this;

    vm.carregando            = false;
    vm.mdDialog              = $mdDialog;
    vm.adicionarTarefa       = adicionarTarefa;
    vm.carregaTarefas        = carregaTarefas;
    vm.geraTarefasAleatorias = geraTarefasAleatorias;
    vm.removeTarefa          = removeTarefa;
    vm.geraTarefa            = geraTarefa;
    vm.executarTarefa        = executarTarefa;
    vm.filtraTarefas         = filtraTarefas;
    vm.verificaStatusTarefa  = verificaStatusTarefa;
    vm.possuiTarefaPendente  = possuiTarefaPendente;

    carregaTarefas();

    function filtraTarefas(tarefa) {
      return vm.exibeRealizadas ? tarefa : !tarefa.concluida
    }

    function possuiTarefaPendente() {
      return vm.tarefas ? vm.tarefas.filter(t => !t.concluida).length : false;
    }

    // carrega todas as tarefas
    function carregaTarefas() {
      TarefaService.carregaTarefas()
        .then(( tarefas ) => {
          vm.tarefas = angular.copy(tarefas);
          vm.carregando = false;
        });
    }

    function geraTarefasAleatorias() {
      vm.carregando = true;

      TarefaService.geraTarefasAleatorias()
        .then(() => {
          toastr.success("Novas tarefas foram adicionadas para você :)")
          vm.carregaTarefas();
        }).catch(({ data }) => {
          toastr.error(data.message, "Atenção")
          vm.carregando = false;
        });
    }

    function removeTarefa(id) {
      TarefaService.removeTarefa(id)
        .then(() => {
          toastr.success("Tarefa excluida com sucesso :)")
          vm.carregaTarefas();
        }).catch(({ data }) => {
          toastr.error(data.message, "Atenção")
        });
    }

    function executarTarefa(tarefa, senha) {      
      TarefaService.executarTarefa(tarefa.id, senha)
        .then(() => {
          toastr.success("Tarefa atualizada com sucesso :)")
          vm.carregaTarefas();
        }).catch(({ data }) => {
          toastr.error(data.message, "Atenção")
          tarefa.concluida = !tarefa.concluida
        });
    }

    function verificaStatusTarefa(tarefa) {

        if (tarefa.concluida) {
          
          vm.mdDialog.show({
            controller: DialogLiberacaoController,
            controllerAs : 'ctrl',
            templateUrl: '../../../../app/src/tarefas/views/tarefa.liberacao.dialog.html',
            parent: angular.element(document.body),
            clickOutsideToClose:true
          })
          .then((senha) => {
            vm.executarTarefa(tarefa, senha)     
          }, () => {
            tarefa.concluida = !tarefa.concluida;
          });
      
        } else {
          vm.executarTarefa(tarefa)
        }
    }

    function geraTarefa(payload) {
      TarefaService.geraTarefa(payload)
        .then(() => {
          toastr.success("Tarefa criada com sucesso :)")
          vm.carregaTarefas();
        }).catch(({ data }) => {
          toastr.error(data.message, "Atenção")
        });
    }
 

    function adicionarTarefa(ev) {
      vm.mdDialog.show({
        controller: DialogInserirController,
        controllerAs : 'ctrl',
        templateUrl: '../../../../app/src/tarefas/views/tarefa.insert.dialog.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true
      })
      .then(function(data) {
        vm.geraTarefa(data);        
      });
    };
  
    function DialogInserirController($mdDialog) {
      const vm = this;

      vm.validandoEmail = false;

      vm.tarefa = {}
  
      vm.cancelar = function() {
        $mdDialog.cancel();
      };
  
      vm.adicionar = function(tarefa) {
        $mdDialog.hide(tarefa);
      };

      vm.verificaEmail = function() {
        /*if (!vm.tarefa.email) {
          toastr.warning("Por favor, informe seu email.","Atenção");
          return;
        }*/

        //toastr.info("Aguarde um momento, estamos validando o seu email :)","Validando email");

        vm.validandoEmail = true;
        TarefaService.verificaEmail(vm.tarefa.email)
        .then((data) => {
          vm.validandoEmail = false;

          const { did_you_mean, format_valid, mx_found } = data;

          if (format_valid && mx_found && !did_you_mean) {
            //toastr.success("Seu email foi validado com sucesso!","Sucesso");
            vm.emailSugestao = null;

            vm.adicionar(vm.tarefa);
          } else {
            toastr.warning("O email informado é inválido!","Atenção");
            vm.emailSugestao = did_you_mean;
          }

        }).catch((err) => {
          vm.validandoEmail = false;
          toastr.error("Houve um erro ao validar o seu email, por favor digite novamente.", "Atenção")
        });
      }

      vm.alteraEmail = () => {
        vm.tarefa.email = vm.emailSugestao;

        vm.emailSugestao = null;
      }
    }

    function DialogLiberacaoController($mdDialog) {
      const vm = this;

      vm.cancelar = function() {
        $mdDialog.cancel();
      };
  
      vm.confirmar = function() {
        $mdDialog.hide(vm.senhaLiberacao);
      }
    }

  }

})();
