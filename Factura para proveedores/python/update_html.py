import codecs
import re

with codecs.open('factura_proveedor.html', 'r', 'utf-8') as f:
    content = f.read()

content = re.sub(r'<style>.*?</style>', '<link rel="stylesheet" href="css/styles.css">', content, flags=re.DOTALL)
content = re.sub(r'<script>\s*document\.getElementById\(\'fecha\'\).*?</script>', '<script src="js/scripts.js"></script>', content, flags=re.DOTALL)

toggles_new = '''            <!-- Panel de Control (No Print) -->
            <div class="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100 no-print" data-html2canvas-ignore="true">
                <div class="flex flex-col md:flex-row justify-between gap-4 items-center">
                    <div class="flex flex-wrap items-center gap-4">
                        <div class="flex items-center gap-2">
                            <span class="text-xs font-bold text-brand uppercase">ISR:</span>
                            <label class="inline-flex items-center cursor-pointer hover:bg-blue-100 px-2 py-1 rounded">
                                <input type="radio" name="tipoServicio" value="10" onchange="calcular()" class="form-radio text-brand">
                                <span class="ml-1 text-sm text-gray-700">10%</span>
                            </label>
                            <label class="inline-flex items-center cursor-pointer hover:bg-blue-100 px-2 py-1 rounded">
                                <input type="radio" name="tipoServicio" value="5" checked onchange="calcular()" class="form-radio text-brand">
                                <span class="ml-1 text-sm text-gray-700 font-bold">5%</span>
                            </label>
                            <label class="inline-flex items-center cursor-pointer hover:bg-blue-100 px-2 py-1 rounded">
                                <input type="radio" name="tipoServicio" value="2" onchange="calcular()" class="form-radio text-brand">
                                <span class="ml-1 text-sm text-gray-700">2%</span>
                            </label>
                            <label class="inline-flex items-center cursor-pointer hover:bg-blue-100 px-2 py-1 rounded">
                                <input type="radio" name="tipoServicio" value="0" onchange="calcular()" class="form-radio text-brand">
                                <span class="ml-1 text-sm text-gray-700">0%</span>
                            </label>
                        </div>
                        
                        <div class="flex items-center gap-2 border-l border-blue-200 pl-4">
                            <span class="text-xs font-bold text-brand uppercase">ITBIS:</span>
                            <label class="inline-flex items-center cursor-pointer hover:bg-blue-100 px-2 py-1 rounded">
                                <input type="radio" name="itbisOpcion" value="18" checked onchange="calcular()" class="form-radio text-brand">
                                <span class="ml-1 text-sm text-gray-700 font-bold">18%</span>
                            </label>
                            <label class="inline-flex items-center cursor-pointer hover:bg-blue-100 px-2 py-1 rounded">
                                <input type="radio" name="itbisOpcion" value="0" onchange="calcular()" class="form-radio text-brand">
                                <span class="ml-1 text-sm text-gray-700">0%</span>
                            </label>
                        </div>
                    </div>

                    <div class="flex items-center gap-4 border-l border-blue-200 pl-4 mt-2 md:mt-0">
                        <span class="text-xs font-bold text-brand uppercase">Cálculo:</span>
                        <label class="inline-flex items-center cursor-pointer">
                            <input type="radio" name="modoCalculo" value="inverso" checked onchange="calcular()"
                                class="form-radio text-brand">
                            <span class="ml-1 text-sm text-gray-700 font-bold">Acrecentamiento (Neto Exacto)</span>
                        </label>
                        <label class="inline-flex items-center cursor-pointer">
                            <input type="radio" name="modoCalculo" value="directo" onchange="calcular()"
                                class="form-radio text-brand">
                            <span class="ml-1 text-sm text-gray-700">Normal</span>
                        </label>
                    </div>
                </div>
            </div>'''
content = re.sub(r'            <!-- Panel de Control \(No Print\) -->.*?</div>\s*</div>\s*</div>', toggles_new, content, flags=re.DOTALL)

with codecs.open('factura_proveedor.html', 'w', 'utf-8') as f:
    f.write(content)
print("Updated HTML")