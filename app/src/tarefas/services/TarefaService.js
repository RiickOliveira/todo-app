(function(){
  'use strict';

  angular.module('Tarefa')
         .service('TarefaService', ['$q','$resource', TarefaService]);
         

  function TarefaService($q, $resource){
    const tarefaAleatoriaResource = $resource('https://cat-fact.herokuapp.com/facts');
    const validaEmailResource = $resource('http://localhost:5000/tarefas/valida-email');
    const tarefaResource = $resource('http://localhost:5000/tarefas/:id', { id: '@id' }, {
      query  : { method :'GET', isArray: true }, 
      save   : { method : 'POST', isArray : true } ,
      delete : { method : 'DELETE' }, 
      update : { method : 'PUT' },
    });


    // Promise-based API
    return {
      carregaTarefas : () => {        
        return tarefaResource.query().$promise.then((data) => data)       
      },

      geraTarefasAleatorias : () => {
        return tarefaAleatoriaResource.query().$promise.then((data) => {
          let tarefas = [];

          for (let i = 1; i <= 3; i++) {
            const random = Math.floor(Math.random() * 4); // quantidade de fatos aleatorios
            tarefas.push(data[random]);
          }

          tarefas = tarefas.map((fact) => ({
              tarefa : fact.text,
              responsavel : 'Eu',
              email : 'eu@me.com'
          }));

          return tarefaResource.save(tarefas).$promise.then(tarefas => tarefas);
        })
      },

      removeTarefa : (id) => {
        return tarefaResource.delete({ id: id }).$promise;
      },

      geraTarefa : (tarefa) => {
        return tarefaResource.save([tarefa]).$promise;
      },

      executarTarefa : (id, senha) => {
        const resource = angular.copy(tarefaResource);
        
        return resource.update({ id : id, senha : senha }).$promise;
      },

      verificaEmail : (email) => {
        return validaEmailResource.save({email}).$promise;
      }
    };
  }

})();
