
export default class RequestDgdHelper {

  public static generateLayoutXML(elementos: any[]): string {
    const elemento = elementos[0]; // Tomamos el primer elemento del array
    
    return `<AgileSignerConfig>
      <Application id="THIS-CONFIG">
        <pdfPassword/>
        <Signature>
          <Visible active="true" layer2="false" label="true" pos="1">
            <llx>${elemento.x}</llx>
            <lly>${elemento.y}</lly>
            <urx>${elemento.x + elemento.w}</urx>
            <ury>${elemento.y + elemento.w}</ury>
            <page>${elemento.pagina}</page>
            <image>BASE64</image>
            <BASE64VALUE>${elemento.valor}</BASE64VALUE>
          </Visible>
        </Signature>
      </Application>
    </AgileSignerConfig>`;
  }
}

