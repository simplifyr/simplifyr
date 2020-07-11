<script>
  import { onMount } from "svelte";
  import { form } from "./store";

  let Range = ace.require("ace/range").Range;

  let editor;
  export let fsize = "13pt";
  export let mode;
  export let eid;
  export let width;
  export let val;
  export let readOnly = false;
  export let showLineNo = true;
  export let maxLines = 20;
  export let highlights = [];

  let styleTagId = `${eid}-style`;

  onMount(function() {
    //document.head.innerHTML += `<style id="${styleTagId}"></style>`;
    addStyleTag();
    setTimeout(function init() {
      editor = ace.edit(eid);
      editor.setTheme("ace/theme/textmate");
      editor.session.setMode("ace/mode/" + mode);
      editor.renderer.setShowGutter(showLineNo);
      editor.getSession().setUseWrapMode(true);
      editor.setShowPrintMargin(false);
      editor.setReadOnly(readOnly);

      editor.setOptions({
        fontFamily: "'Fira Code', monospace",
        fontSize: fsize,
        maxLines: maxLines,
        useWorker: false,
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true
      });

      $form[eid] = editor;

      editor.on("paste", function() {
        setTimeout(afterPaste, 200);
      });

      highlights = __();
      for (var h of highlights) {
        var cls = getNewHighliterClass(h.passed, h.qb);
        editor
          .getSession()
          .addMarker(
            new Range(h.start - 1, 0, h.end, 0),
            cls,
            "line",
            false
          );

        editor.getSession().addGutterDecoration(h.start - 1, cls + '-gutter');
      }
    }, 500);
  });

  function __() {
    if(!highlights) {
      return [];
    }
    var m = {};
    var qb = 1;
    for(var h of highlights) {
      var key = h.start + '-' + h.end;
      if(m[key] == undefined) {
        m[key] = h;
        h.qb = qb;
      } else {
        m[key].qb += ',' + qb;
      }
      qb++;
    }
    return Object.values(m);
  }

  function getNewHighliterClass(passed, qb) {
    var clsName = "hghlght-" + parseInt(new Date().getTime() * Math.random());
    document.getElementById(styleTagId).innerHTML += `
      .${clsName} {
        background-color: ${passed ? '#E8F8F5' : '#FADBD8'};
        position: absolute;
      }

       .${clsName}-gutter::after {
        content: '$${qb}';
        position: absolute;
        background-color: #fff;
        margin-left: -27px;
        padding: 1px 4px;
        z-index: 10;
        font-size: .65rem;
        border-radius: 2px;
        font-weight: 600;
        border: 1px solid #e1e1e1;
        margin-top: 0px;
        width: 30px;
        text-align: center;
      }
    `;

    
    return clsName;
  }


  function addStyleTag() {
    var styleNode = document.createElement('style');
    styleNode.id = styleTagId;
    styleNode.type = "text/css";
    document.head.appendChild(styleNode)
  }

  function afterPaste() {}
</script>

<div id={eid} style="width: {width};">{val}</div>
