function iniciarSimulacion () {
    
    var momentoInicio = {
        fechaInicio: document.getElementById('fechaInicio').value,
        inicioHora: document.getElementById('inicioHora').value,
        inicioMins: document.getElementById('inicioMins').value,
    }

    var momentoFin = {
        fechaFin: document.getElementById('fechaFin').value,
        finHora: document.getElementById('finHora').value,
        finMins: document.getElementById('finMins').value,
    }

    if (momentoInicio.inicioHora > 23 || momentoInicio.inicioMins > 59) {
        alert('La hora de inicio que ingresaste no es valida');
        return;
    } else {
        var inicioSimulacion = new Date(momentoInicio.fechaInicio);
        inicioSimulacion.setHours = momentoInicio.inicioHora;
        inicioSimulacion.setMinutes = momentoInicio.inicioMins;
        console.log(inicioSimulacion);
    }

    if (momentoFin.finHora > 23 || momentoFin.finMins > 59) {
        alert('La hora de fin que ingresaste no es valida');
        return;
    } else {
        var finSimulacion = new Date(momentoFin.fechaFin);
        finSimulacion.setHours = momentoFin.finHora;
        finSimulacion.setMinutes = momentoFin.finMins;
        console.log(finSimulacion);
    }

}