var viaAuxiliar = 0;
var registro_viaAuxiliar = Array();
var registro_embotellamientos = Array();

const timer = ms => new Promise(res => setTimeout(res, ms));

async function generarSimulacion (momentoSimulacion, fechaConclusion, intervaloEvaluacion = 30, tipoSimulacion = 1, tiempoIntervalo = 1000) {

    viaAuxiliar = 0;
    registro_viaAuxiliar = Array();
    registro_embotellamientos = Array();

    document.getElementById("reporteEmbotellamiento").innerHTML = "";
    document.getElementById("reporteAuxiliar").innerHTML = "";

    if (fechaConclusion.getTime() < momentoSimulacion.getTime()) {
        alert('Fecha de Inicio posterior a Fecha de Conclusion, no es posible realizar la simulacion.');
        return;
    }

    console.log('Inicio de Simulacion: ' + momentoSimulacion);
    console.log( 'Fin de Simulacion: ' + fechaConclusion);

    while (fechaConclusion.getTime() >= momentoSimulacion.getTime()) {
        
        console.log('Momento de Simulacion - ' + momentoSimulacion);

        var datosEvaluacion_NorSur = evaluacionVia(momentoSimulacion, 1);
        var datosEvaluacion_SurNor = evaluacionVia(momentoSimulacion, 2);

        var traficoAuxiliar = 0;

        if (datosEvaluacion_NorSur.densidadMomento == 0 && datosEvaluacion_SurNor.densidadMomento == 0 && viaAuxiliar !== 0) {
            viaAuxiliar = 0;
            traficoAuxiliar = 0;
            var eventoVia = {
                tipoEvento : 'Cerrado',
                momentoSimulacion: momentoSimulacion,
                sentidoEvento: viaAuxiliar,
            }
            registro_viaAuxiliar.push(eventoVia);
            console.log('Close de via: ' + momentoSimulacion);
        }
        
        var densidadMaxima = 126;

        datosEvaluacion_NorSur.arrayKilometros = generarAleatorio(densidadMaxima, datosEvaluacion_NorSur.densidadMomento - 1);

        if (viaAuxiliar == 1) {
            datosEvaluacion_NorSur.arrayKilometros = repartirDensidad(datosEvaluacion_NorSur.arrayKilometros);
        }

        console.log(datosEvaluacion_NorSur);

        datosEvaluacion_SurNor.arrayKilometros = generarAleatorio(densidadMaxima, datosEvaluacion_SurNor.densidadMomento);

        if (viaAuxiliar == 2) {
            datosEvaluacion_SurNor.arrayKilometros = repartirDensidad(datosEvaluacion_SurNor.arrayKilometros);
        }

        console.log(datosEvaluacion_SurNor);

        decidirTransito(datosEvaluacion_NorSur, datosEvaluacion_SurNor, momentoSimulacion);

        generarFront(momentoSimulacion, datosEvaluacion_NorSur, datosEvaluacion_SurNor, viaAuxiliar, traficoAuxiliar);

        await timer(tiempoIntervalo);

        momentoSimulacion = new Date((momentoSimulacion.getTime() + (intervaloEvaluacion*60*1000)));
    }

    console.log('Registro de via Auxiliar');
    console.log(registro_viaAuxiliar);

    reporteAuxiliar(registro_viaAuxiliar);

    console.log('Registro de embotellamientos');
    console.log(registro_embotellamientos);

    reporteEmbotellamientos(registro_embotellamientos);

}

function evaluacionVia (momentoSimulacion, sentidoVia) {

    var diaSimulacion = momentoSimulacion.getDay();
    var horasPico;

    if (diaSimulacion > 0 && diaSimulacion < 6) {
        

        if (sentidoVia == 1) {

            horasPico = [[[6,0],[9,0],119], [[11,30],[13,0],105], [[17,0],[19,30],120]];

        } else {
            
            horasPico = [[[6,0],[9,0],117], [[11,30],[13,0],98], [[17,0],[21,15], 76]];

        }

    } else {
        

        if (sentidoVia == 1) {
        
            horasPico = [[[13,0],[15,0],107], [[18,0],[20,0],80]];

        } else {
            
            horasPico = [[[7,0],[9,30],105], [[16,30],[22,0],54]];

        }

    }
 
    
    var densidadRetorno = 0;
    var horasPicoRetorno = Array();

    horasPico.forEach(horaPico => {

        var horaInicio = new Date(momentoSimulacion.getFullYear(), momentoSimulacion.getMonth(), momentoSimulacion.getDate());
        
        horaInicio.setHours(horaPico[0][0]);
        horaInicio.setMinutes(horaPico[0][1]);
        horaInicio.setSeconds(0);

        var horaFin = new Date(momentoSimulacion.getFullYear(), momentoSimulacion.getMonth(), momentoSimulacion.getDate());
        horaFin.setHours(horaPico[1][0]);
        horaFin.setMinutes(horaPico[1][1]);
        horaFin.setSeconds(0);
        
        horasPicoRetorno.push([horaInicio, horaFin]);

        if (momentoSimulacion.getTime() >= horaInicio.getTime() && momentoSimulacion.getTime() < horaFin.getTime()) {
            densidadRetorno = horaPico[2];
        }

    });

    var datosRetorno = {
        horasPico: horasPicoRetorno,
        densidadMomento: densidadRetorno,
        via: sentidoVia,
    }

    return datosRetorno;
    
}

function decidirTransito (viaEvaluar1, viaEvaluar2, momentoSimulacion) {

   var embotellamientos_via1 = contarEmbotellamientos(viaEvaluar1, momentoSimulacion);
   var embotellamientos_via2 = contarEmbotellamientos(viaEvaluar2, momentoSimulacion);

   var viaEscogida = null;

    if (embotellamientos_via1 == embotellamientos_via2 && embotellamientos_via1 !== 0) {
        viaEscogida = viaEvaluar1;
        viaEscogida.embotellamientos = embotellamientos_via1;

    }

   if (embotellamientos_via1 > embotellamientos_via2) {
        viaEscogida = viaEvaluar1;
        viaEscogida.embotellamientos = embotellamientos_via1;
        
   } else if (embotellamientos_via1 < embotellamientos_via2) {
        viaEscogida = viaEvaluar2;
        viaEscogida.embotellamientos = embotellamientos_via2;
   }

   if (viaEscogida !== null) {
        if (viaAuxiliar == 0) {
            if (viaEscogida.densidadMomento !== 0) {
                viaAuxiliar = viaEscogida.via;
                evento_viaAuxiliar = {
                    tipoEvento: 'Apertura',
                    momentoSimulacion: momentoSimulacion,
                    detallesEvento: viaEscogida,
                }
                console.log('Via socorrida: ' + viaEscogida.via + ', embotellamientos: ' + viaEscogida.embotellamientos);
                registro_viaAuxiliar.push(evento_viaAuxiliar);
            }
        }
   }

}

function contarEmbotellamientos (viaEvaluar, momentoSimulacion) {

    var vigilanteKilometro = 0;
    var contadorEmbotellamientos = 0;
    viaEvaluar.arrayKilometros.forEach(kilometroDensidad => {
        
        if (kilometroDensidad >= 125) {
          
            var embotellamiento = {
            momentoSimulacion: momentoSimulacion,
            viaCuestion: viaEvaluar.via,
            numeroVehiculos: kilometroDensidad,
            kilometroResponsable: vigilanteKilometro,
           }

           registro_embotellamientos.push(embotellamiento);
           contadorEmbotellamientos++;
        }
        vigilanteKilometro++;
        
    });

    return contadorEmbotellamientos;

}

function repartirDensidad (viaRepatir) {
    
    for (let index = 0; index < viaRepatir.length; index++) {
        
        viaRepatir[index] = Math.trunc(viaRepatir[index]*3/5);

    }

    return viaRepatir;

}

function generarViaAuxiliar(datosEvaluacion) {
    
    for (let index = 0; index < (datosEvaluacion.length - 1); index++) {
        
        datosEvaluacion[index] = Math.trunc(datosEvaluacion[index]*2/5);

    }

    return datosEvaluacion;

}

function generarAleatorio (max, min) {

    var arrayAleatorios = Array(12);

    for (let index = 0; index <= (arrayAleatorios.length - 1); index++) {

        arrayAleatorios[index] = Math.trunc(Math.random()*(max - min) + min);
        
    }

    return arrayAleatorios;
}

function generarVia (datosEvaluacion, lista_id) {

    var listaRellenar = document.getElementById(lista_id);
    listaRellenar.innerHTML = "";

    datosEvaluacion.arrayKilometros.forEach(kilometroDensidad => {
        
        let textoDensidad = document.createTextNode(kilometroDensidad);
        let itemDensidad = document.createElement('li');

        itemDensidad.appendChild(textoDensidad);
        
        if (kilometroDensidad >= 125) {
            itemDensidad.style.color = "red";
            itemDensidad.style.fontWeight = "bold";
        }

        listaRellenar.appendChild(itemDensidad);

    });

}

function generarFront (momentoSimulacion, via1, via2, viaAuxiliar,  traficoAuxiliar) {
    
    var relojSimulacion = document.getElementById('reloj');
    relojSimulacion.innerHTML = "";
    var textoReloj = document.createTextNode(momentoSimulacion);
    relojSimulacion.appendChild(textoReloj);

    generarVia(via1, 'via1');
    generarVia(via2, 'via2');

    let label1Pico = document.getElementById('picoNS');
    label1Pico.innerHTML = "";

    let label2Pico = document.getElementById('picoSN');
    label2Pico.innerHTML = "";

    if (via1.densidadMomento > 0) {
        label1Pico.style.color = "red";
        let labelTexto = document.createTextNode('Hora Pico');
        label1Pico.appendChild(labelTexto);
    }

    if (via2.densidadMomento > 0) {
        label2Pico.style.color = "red";
        let labelTexto = document.createTextNode('Hora Pico');
        label2Pico.appendChild(labelTexto);
    }

    var direccionAuxiliar = document.getElementById('direccionAuxiliar');
    direccionAuxiliar.innerHTML = "";
    var direccionAuxiliarTexto;

    if (viaAuxiliar == 0) {
        direccionAuxiliarTexto = document.createTextNode('Via Auxiliar Cerrada');
    }

    if (viaAuxiliar == 1) {
        direccionAuxiliarTexto = document.createTextNode('Via Auxiliar habilitada, Sentido Norte-Sur');
    }

    if (viaAuxiliar == 2) {
        direccionAuxiliarTexto = document.createTextNode('Via Auxiliar habilitada, Sentido Sur-Norte');
    }

    direccionAuxiliar.appendChild(direccionAuxiliarTexto);

}


function iniciarSimulacion () {
    
    var momentoInicio = {
        fechaInicio: document.getElementById('fechaInicio').value,
        inicioHora: parseInt(document.getElementById('inicioHora').value),
        inicioMins: parseInt(document.getElementById('inicioMins').value),
    }

    var momentoFin = {
        fechaFin: document.getElementById('fechaFin').value,
        finHora: parseInt(document.getElementById('finHora').value),
        finMins: parseInt(document.getElementById('finMins').value),
    }

    if (momentoInicio.fechaInicio == "" || isNaN(momentoInicio.inicioHora) == true) {
        alert("Datos de inicio de Simulacion Incompletos o incorrectos");
        return;
    }

    if (momentoFin.fechaFin == "" || isNaN(momentoFin.finHora) == true) {
        alert("Datos de Fin de Simulacion incompletos o incorrectos");
        return;
    }


    if (momentoInicio.inicioHora > 23 || momentoInicio.inicioMins > 59) {
        alert('La hora de inicio no es valida');
        return;
    }

        var inicioSimulacion = new Date(momentoInicio.fechaInicio);
        inicioSimulacion.setHours(momentoInicio.inicioHora);
        if (isNaN(momentoInicio.inicioMins) == true) {
            momentoInicio.inicioMins = 0;
        }
        inicioSimulacion.setMinutes(momentoInicio.inicioMins);
    

    if (momentoFin.finHora > 23 || momentoFin.finMins > 59) {
        alert('La hora de fin no es valida');
        return;
    } 

        var finSimulacion = new Date(momentoFin.fechaFin);
        finSimulacion.setHours(momentoFin.finHora);
        if (isNaN(momentoFin.finMins) == true) {
            momentoFin.finMins = 0;
        }
        finSimulacion.setMinutes(momentoFin.finMins);
    

    generarSimulacion(inicioSimulacion, finSimulacion);

}

function reporteEmbotellamientos(registro_embotellamientos) {

    var reportesDIV = document.getElementById("reporteEmbotellamiento");

    registro_embotellamientos.forEach(embotellamiento => {
        var reporte = document.createElement('h4');
        var reporteTexto = "Via: " + embotellamiento.viaCuestion + ", Numero de vehiculos: " + embotellamiento.numeroVehiculos + ", Kilometro: " + embotellamiento.kilometroResponsable + ", Fecha: " + embotellamiento.momentoSimulacion.getDate() + "/" + embotellamiento.momentoSimulacion.getMonth() + "/" + embotellamiento.momentoSimulacion.getFullYear() + ", Hora: " + embotellamiento.momentoSimulacion.getHours() + ":" + embotellamiento.momentoSimulacion.getMinutes();
        reporteTexto = document.createTextNode(reporteTexto);
        reporte.appendChild(reporteTexto);
        reportesDIV.appendChild(reporte);
    });
}

function reporteAuxiliar(registro_viaAuxiliar) {

    var reportesDIV = document.getElementById("reporteAuxiliar");

    registro_viaAuxiliar.forEach(evento => {
        var reporte = document.createElement('h4');
        if (evento.detallesEvento) {
            var reporteTexto = evento.tipoEvento + ", Sentido: " + evento.detallesEvento.via + ", Fecha: "  + evento.momentoSimulacion.getDate() + "/" + evento.momentoSimulacion.getMonth() + "/" + evento.momentoSimulacion.getFullYear() + ", Hora: " + evento.momentoSimulacion.getHours() + ":" + evento.momentoSimulacion.getMinutes();
        } else {var reporteTexto = evento.tipoEvento + ", Fecha: "  + evento.momentoSimulacion.getDate() + "/" + evento.momentoSimulacion.getMonth() + "/" + evento.momentoSimulacion.getFullYear() + ", Hora: " + evento.momentoSimulacion.getHours() + ":" + evento.momentoSimulacion.getMinutes();}
        reporteTexto = document.createTextNode(reporteTexto);
        reporte.appendChild(reporteTexto);
        reportesDIV.appendChild(reporte);
    });
}

