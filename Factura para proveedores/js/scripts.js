document.getElementById('fecha').valueAsDate = new Date();

window.onload = function () {
    calcular();
};

function formatCurrency(amount) {
    return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP', minimumFractionDigits: 2 }).format(amount);
}

function formatInput(input) {
    let value = input.value.replace(/[^0-9.]/g, '');
    const parts = value.split('.');
    if (parts.length > 2) value = parts[0] + '.' + parts.slice(1).join('');
    let [integer, decimal] = value.split('.');
    if (integer) integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    input.value = integer + (decimal !== undefined ? '.' + decimal : (value.endsWith('.') ? '.' : ''));
}

function calcular() {
    const rawValue = document.getElementById('monto').value;
    const inputMonto = parseFloat(rawValue.replace(/,/g, '')) || 0;

    let tasaIsr = 0.10;
    document.getElementsByName('tipoServicio').forEach(r => { if (r.checked) { tasaIsr = r.value / 100; document.getElementById('label-isr-percent').innerText = r.value; } });

    let tasaItbis = 0.18;
    const itbisOpciones = document.getElementsByName('itbisOpcion');
    if (itbisOpciones.length > 0) {
        itbisOpciones.forEach(r => { if (r.checked) { tasaItbis = r.value / 100; } });
    }

    let modo = 'directo';
    document.getElementsByName('modoCalculo').forEach(r => { if (r.checked) modo = r.value; });

    let subtotal = 0;

    if (modo === 'inverso') {
        document.getElementById('label-monto').innerText = "Monto Neto a Pagar";
        subtotal = (tasaIsr === 1) ? 0 : inputMonto / (1 - tasaIsr);
    } else {
        document.getElementById('label-monto').innerText = "Subtotal Servicio";
        subtotal = inputMonto;
    }

    const itbis = subtotal * tasaItbis;
    const totalFacturado = subtotal + itbis;
    const retIsr = subtotal * tasaIsr;
    const retItbis = itbis;
    const totalPagar = totalFacturado - retIsr - retItbis;

    document.getElementById('res-subtotal').innerText = formatCurrency(subtotal);
    document.getElementById('res-itbis').innerText = formatCurrency(itbis);
    document.getElementById('res-total-facturado').innerText = formatCurrency(totalFacturado);
    document.getElementById('res-ret-isr').innerText = "- " + formatCurrency(retIsr);
    document.getElementById('res-ret-itbis').innerText = "- " + formatCurrency(retItbis);
    document.getElementById('res-total-pagar').innerText = formatCurrency(totalPagar);
}

// --- SISTEMA UNIFICADO DE DOCUMENTO (PDF E IMPRESIÓN) --- //

let divReplacement = null;
let montoReplacement = null;

function prepararDocumento() {
    const element = document.getElementById('invoice-container');

    // 1. Transformar Textarea en DIV (Para que salga todo el texto sin scroll)
    const textArea = document.getElementById('concepto');
    divReplacement = document.createElement('div');
    divReplacement.className = textArea.className;
    divReplacement.classList.add('pdf-text-content');
    divReplacement.innerText = textArea.value || ' ';

    textArea.parentNode.insertBefore(divReplacement, textArea);
    textArea.style.display = 'none';

    // 2. SOLUCIÓN MONTO: Reemplazar todo el input y el símbolo flotante por texto plano
    const montoInput = document.getElementById('monto');
    const montoWrapper = document.getElementById('monto-input-wrapper');

    // Crear el elemento de texto plano con estilos inline para garantizar visibilidad
    montoReplacement = document.createElement('div');
    montoReplacement.style.cssText = 'font-size: 24px; font-weight: bold; color: #00AEEF; padding: 12px; background: #f9fafb; border-radius: 6px; display: block;';
    // Si el input tiene valor, usamos "RD$ Valor", si no "RD$ 0.00"
    const valorMonto = montoInput.value || '0.00';
    montoReplacement.innerText = `RD$ ${valorMonto}`;

    // Ocultar wrapper original (que tiene input y simbolo) e insertar reemplazo
    montoWrapper.style.display = 'none';
    montoWrapper.parentNode.insertBefore(montoReplacement, montoWrapper);

    // 3. Mostrar las firmas (quitar la clase hidden)
    const firmasContainer = document.getElementById('firmas-container');
    firmasContainer.classList.remove('hidden');
    firmasContainer.style.display = 'grid';

    // 4. Aplicar estilos unificados de "Modo Impresión/PDF"
    element.classList.add('print-mode');
}

function restaurarDocumento() {
    const element = document.getElementById('invoice-container');

    // 1. Quitar estilos
    element.classList.remove('print-mode');

    // 2. Restaurar textarea
    const textArea = document.getElementById('concepto');
    if (divReplacement && divReplacement.parentNode) {
        divReplacement.parentNode.removeChild(divReplacement);
    }
    textArea.style.display = 'block';
    divReplacement = null;

    // 3. Restaurar Monto Input
    const montoWrapper = document.getElementById('monto-input-wrapper');
    if (montoReplacement && montoReplacement.parentNode) {
        montoReplacement.parentNode.removeChild(montoReplacement);
    }
    montoWrapper.style.display = 'block'; // Volver a mostrar input original
    montoReplacement = null;

    // 4. Ocultar las firmas nuevamente
    const firmasContainer = document.getElementById('firmas-container');
    firmasContainer.classList.add('hidden');
    firmasContainer.style.display = '';
}

// Función para Imprimir Directamente (Window.print)
function imprimirDirecto() {
    const btn = document.getElementById('btn-print');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Preparando...';

    prepararDocumento();

    setTimeout(() => {
        window.print();
    }, 500);

    window.onafterprint = () => {
        restaurarDocumento();
        btn.innerHTML = originalText;
        window.onafterprint = null;
    };

    // Fallback por si onafterprint falla
    setTimeout(() => {
        const element = document.getElementById('invoice-container');
        if (element.classList.contains('print-mode')) {
            // No restauramos el DOM para no romper la vista previa de impresión en curso
            // Pero devolvemos el botón a su estado
            btn.innerHTML = originalText;
            // Intentamos restaurar después de un tiempo prudencial
            setTimeout(restaurarDocumento, 1000);
        }
    }, 5000); // 5 segundos
}

// Función para Generar PDF automáticamente
function descargarPDF() {
    const btn = document.getElementById('btn-pdf');
    const originalText = btn.innerHTML;

    btn.innerHTML = '<i class="fas fa-circle-notch fa-spin mr-2"></i> Generando PDF...';
    btn.disabled = true;
    btn.classList.add('opacity-75', 'cursor-not-allowed');

    // Obtener datos para el nombre del archivo
    const nombreRaw = document.getElementById('nombre').value || 'Proveedor';
    const ncfRaw = document.getElementById('ncf').value || '';
    const nombreSanitized = nombreRaw.replace(/[^a-z0-9\s]/gi, '').replace(/\s+/g, '_');
    const ncfSanitized = ncfRaw.replace(/[^a-z0-9]/gi, '');
    const nombreArchivo = `Factura_${nombreSanitized}_${ncfSanitized}.pdf`;

    // Clonar el contenedor original
    const original = document.getElementById('invoice-container');
    const clone = original.cloneNode(true);
    clone.id = 'invoice-clone';

    // Crear un wrapper para ocultar el clon visualmente pero mantenerlo capturale
    const wrapper = document.createElement('div');
    wrapper.id = 'pdf-wrapper';
    wrapper.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; overflow: hidden; z-index: -9999; pointer-events: none;';

    // Aplicar estilos al clon para PDF
    clone.style.cssText = 'width: 760px; max-width: 760px; background: white; padding: 0; margin: 0; position: absolute; top: 0; left: 0;';
    clone.classList.add('print-mode');

    // Remover elementos no-print del clon
    clone.querySelectorAll('.no-print, [data-html2canvas-ignore]').forEach(el => el.remove());

    // Mostrar firmas en el clon
    const firmasClone = clone.querySelector('#firmas-container');
    if (firmasClone) {
        firmasClone.classList.remove('hidden');
        firmasClone.style.display = 'grid';
        firmasClone.style.marginTop = '2rem';
    }

    // Reemplazar textarea por div en el clon
    const textareaClone = clone.querySelector('#concepto');
    if (textareaClone) {
        const divConcepto = document.createElement('div');
        divConcepto.className = 'pdf-text-content';
        divConcepto.style.cssText = 'white-space: pre-wrap; font-size: 10px; line-height: 1.3; padding: 8px; background: #f9fafb; border-radius: 6px; min-height: 60px;';
        divConcepto.innerText = document.getElementById('concepto').value || ' ';
        textareaClone.parentNode.replaceChild(divConcepto, textareaClone);
    }

    // Reemplazar input de monto por texto visible en el clon
    const montoWrapperClone = clone.querySelector('#monto-input-wrapper');
    if (montoWrapperClone) {
        const valorMonto = document.getElementById('monto').value || '0.00';
        const divMonto = document.createElement('div');
        divMonto.style.cssText = 'font-size: 20px; font-weight: bold; color: #00AEEF; padding: 10px; background: #f9fafb; border-radius: 6px;';
        divMonto.innerText = `RD$ ${valorMonto}`;
        montoWrapperClone.parentNode.replaceChild(divMonto, montoWrapperClone);
    }

    // Agregar el clon al wrapper y el wrapper al body
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    // Esperar renderizado y generar PDF
    setTimeout(() => {
        const opt = {
            margin: 0.3,
            filename: nombreArchivo,
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                logging: false,
                scrollX: 0,
                scrollY: 0,
                width: clone.scrollWidth,
                height: clone.scrollHeight,
                backgroundColor: '#ffffff'
            },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
            pagebreak: { mode: 'avoid-all' }
        };

        html2pdf().from(clone).set(opt).save()
            .then(() => {
                // Eliminar el wrapper (con el clon adentro)
                if (wrapper.parentNode) {
                    wrapper.parentNode.removeChild(wrapper);
                }
                btn.innerHTML = originalText;
                btn.disabled = false;
                btn.classList.remove('opacity-75', 'cursor-not-allowed');
            })
            .catch((err) => {
                console.error("Error al generar PDF:", err);
                if (wrapper.parentNode) {
                    wrapper.parentNode.removeChild(wrapper);
                }
                btn.innerHTML = originalText;
                btn.disabled = false;
                btn.classList.remove('opacity-75', 'cursor-not-allowed');
                alert("Error al generar el PDF. Por favor intente de nuevo.");
            });
    }, 500);
}

function limpiar() {
    if (confirm('¿Borrar todos los campos?')) {
        document.getElementById('monto').value = '';
        document.getElementById('nombre').value = '';
        document.getElementById('rnc').value = '';
        document.getElementById('concepto').value = '';
        document.getElementById('fecha').valueAsDate = new Date();
        calcular();
    }
}
