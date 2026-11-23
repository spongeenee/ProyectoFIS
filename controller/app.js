let colorElegido = null;
let colorConfirmado = null;
const paleta = document.getElementById("paleta");
const confirmar = document.getElementById("confirmar");
const guardar = document.getElementById("guardar");
const mensaje = document.getElementById("mensaje");

confirmar.onclick = confirmarColor;
guardar.onclick = guardarSweater;
cargarColores();

async function cargarColores() {
    try {
        const respuesta = await fetch("/api/colores");
        if (!respuesta.ok) throw new Error("No se pudieron cargar los colores.");
        const colores = await respuesta.json();
        if (!colores.length) throw new Error("No hay colores disponibles.");

        colores.forEach(function (c, indice) {
            const boton = document.createElement("button");
            boton.type = "button";
            boton.className = "color";
            const muestra = document.createElement("span");
            muestra.style.backgroundColor = c.hex;
            muestra.setAttribute("aria-hidden", "true");
            boton.append(muestra, document.createTextNode(c.nombre));
            boton.title = c.nombre;
            boton.setAttribute("aria-label", c.nombre);
            boton.setAttribute("aria-pressed", "false");
            boton.onclick = function () { cambiarColor(c, boton); };
            paleta.appendChild(boton);
            if (indice === 0) cambiarColor(c, boton);
        });
        confirmar.disabled = false;
    } catch (error) {
        document.getElementById("resultado").textContent = "Colores no disponibles";
        mensaje.textContent = error.message;
    }
}

function cambiarColor(c, boton) {
    if (colorElegido?.id !== c.id) {
        colorConfirmado = null;
        guardar.disabled = true;
    }
    colorElegido = c;
    document.getElementById("sueter").style.fill = c.hex;
    document.getElementById("resultado").textContent = c.nombre;
    document.querySelectorAll(".color").forEach(function (b) {
        b.classList.remove("activo");
        b.setAttribute("aria-pressed", "false");
    });
    boton.classList.add("activo");
    boton.setAttribute("aria-pressed", "true");
    mensaje.textContent = "";
}

function confirmarColor() {
    if (!colorElegido) return;
    colorConfirmado = colorElegido;
    guardar.disabled = false;
    mensaje.textContent = "Color confirmado: " + colorConfirmado.nombre;
}

async function guardarSweater() {
    if (!colorConfirmado || guardar.disabled) return;
    const color = colorConfirmado;
    guardar.disabled = true;
    confirmar.disabled = true;
    mensaje.textContent = "Guardando sweater...";
    try {
        const respuesta = await fetch("/api/disenos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idColor: color.id })
        });
        const datos = await respuesta.json();
        if (!respuesta.ok) throw new Error(datos.error || "No se pudo guardar el sweater.");
        mensaje.textContent = "¡Sweater guardado en " + color.nombre + "! ";
    } catch (error) {
        mensaje.textContent = "No se guardó el sweater. " + error.message;
    } finally {
        guardar.disabled = !colorConfirmado;
        confirmar.disabled = false;
    }
}
