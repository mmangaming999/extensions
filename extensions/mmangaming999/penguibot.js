/* Penguibot V5.1 - MIT License. Direct OpenAI API for private use only. */
(function (Scratch) {
  'use strict';
  const T = Scratch.BlockType;
  const A = Scratch.ArgumentType;
  class OpenAIExtension {
    constructor() {
      this.apiKey = ''; // Session memory only; never serialized.
      this.imageModel = 'gpt-image-2';
      this.imageSize = '1024x1024';
      this.customImageSize = '';
      this.resizeImageSize = '';
      this.resizeMode = 'fit';
      this.imageQuality = 'auto';
      this.activeRequests = 0;
      this.model = 'gpt-4.1-mini';
      this.customModel = 'gpt-4.1-mini';
      this.maxTokens = 200;
      this.mode = 'automatic';
      this.moodText = 'You are an expert in PenguinMod.';
      this.history = [];
      this.savedHistory = [];
      this.answerText = '';
      this.errorText = '';
      this.success = false;
    }
    getInfo() {
      return {
        id: 'mmangaming999penguibot', name: 'Penguibot', color1: '#2389D4', color2: '#176BA8', color3: '#104F83',
        blocks: [
          {blockType:T.LABEL,text:'Setup'},
          {opcode:'setApiKey',blockType:T.COMMAND,text:'set API key to [KEY]',arguments:{KEY:{type:A.STRING,defaultValue:''}}},
          {opcode:'testConnection',blockType:T.COMMAND,text:'test API connection'},
          {opcode:'chooseModel',blockType:T.COMMAND,text:'choose model [MODEL]',arguments:{MODEL:{type:A.STRING,menu:'models'}}},
          {opcode:'setCustomModel',blockType:T.COMMAND,text:'set custom model ID to [MODEL]',arguments:{MODEL:{type:A.STRING,defaultValue:'gpt-4.1-mini'}}},
          {blockType:T.LABEL,text:'Chats'},
          {opcode:'askAndWait',blockType:T.COMMAND,text:'ask model [PROMPT] and wait',arguments:{PROMPT:{type:A.STRING,defaultValue:'Hello!'}}},
          {opcode:'ask',blockType:T.REPORTER,text:'ask model [PROMPT]',arguments:{PROMPT:{type:A.STRING,defaultValue:'What is PenguinMod?'}}},
          {opcode:'getAnswer',blockType:T.REPORTER,text:'AI answer',disableMonitor:true},
          {blockType:T.LABEL,text:'Advanced Chat Settings'},
          {opcode:'setLength',blockType:T.COMMAND,text:'set maximum answer length to [COUNT]',arguments:{COUNT:{type:A.NUMBER,defaultValue:200}}},
          {blockType:T.LABEL,text:'Mood'},
          {opcode:'setMood',blockType:T.COMMAND,text:'set mood to [MOOD]',arguments:{MOOD:{type:A.STRING,defaultValue:'You are an expert in PenguinMod.'}}},
          {opcode:'getMood',blockType:T.REPORTER,text:'mood'},
          {opcode:'resetMood',blockType:T.COMMAND,text:'reset mood'},
          {blockType:T.LABEL,text:'Memory'},
          {opcode:'setMemoryMode',blockType:T.COMMAND,text:'set memory [MODE]',arguments:{MODE:{type:A.STRING,menu:'memoryModes'}}},
          {opcode:'addMemory',blockType:T.COMMAND,text:'add [TEXT] to memory',arguments:{TEXT:{type:A.STRING,defaultValue:'My name is Penguin.'}}},
          {opcode:'getMemory',blockType:T.REPORTER,text:'memory',disableMonitor:true},
          {opcode:'clearMemory',blockType:T.COMMAND,text:'clear memory'},
          {blockType:T.LABEL,text:'Advanced Memory Settings'},
          {opcode:'saveMemory',blockType:T.COMMAND,text:'save memory'},
          {opcode:'loadMemory',blockType:T.COMMAND,text:'load memory'},
          {blockType:T.LABEL,text:'Images'},
          {opcode:'generateImage',blockType:T.COMMAND,text:'generate image [PROMPT] as [DEST]',arguments:{PROMPT:{type:A.STRING,defaultValue:'A cat on the moon'},DEST:{type:A.STRING,menu:'destinations'}}},
          {opcode:'setImageModel',blockType:T.COMMAND,text:'choose image model [MODEL]',arguments:{MODEL:{type:A.STRING,menu:'imageModels'}}},
          {opcode:'getImageModel',blockType:T.REPORTER,text:'image model'},
          {opcode:'setImageSize',blockType:T.COMMAND,text:'set image size [SIZE]',arguments:{SIZE:{type:A.STRING,menu:'imageSizes'}}},
          {opcode:'setImageQuality',blockType:T.COMMAND,text:'set image quality [QUALITY]',arguments:{QUALITY:{type:A.STRING,menu:'imageQualities'}}},
          {blockType:T.LABEL,text:'Advanced Image Settings'},
          {opcode:'setCustomImageSize',blockType:T.COMMAND,text:'set custom image size to [SIZE]',arguments:{SIZE:{type:A.STRING,defaultValue:'480x360'}}},
          {opcode:'clearCustomImageSize',blockType:T.COMMAND,text:'clear custom image size'},
          {opcode:'getImageSize',blockType:T.REPORTER,text:'image size'},
          {opcode:'customSizeActive',blockType:T.BOOLEAN,text:'custom image size active?'},
          {opcode:'setResizeImage',blockType:T.COMMAND,text:'resize next generated image to [SIZE]',arguments:{SIZE:{type:A.STRING,defaultValue:'40x40'}}},
          {opcode:'clearResizeImage',blockType:T.COMMAND,text:'clear output resize'},
          {opcode:'setResizeMode',blockType:T.COMMAND,text:'resize mode [MODE]',arguments:{MODE:{type:A.STRING,menu:'resizeModes'}}},
          {blockType:T.LABEL,text:'Status'},
          {opcode:'isGenerating',blockType:T.BOOLEAN,text:'AI is generating?'},
          {opcode:'isSuccessful',blockType:T.BOOLEAN,text:'AI request successful?'},
          {opcode:'lastError',blockType:T.REPORTER,text:'last error',disableMonitor:true}
        ],
        menus: {
          models: {acceptReporters:true,items:['gpt-4.1-mini','gpt-4.1','gpt-4o-mini','gpt-4o','Custom']},
          imageModels: {acceptReporters:true,items:['gpt-image-2','gpt-image-2.5-flare','gpt-image-2.5-sunburst']},
          imageSizes: {acceptReporters:false,items:['1024x1024','1536x1024','1024x1536']},
          imageQualities: {acceptReporters:false,items:['auto','low','medium','high']},
          resizeModes: {acceptReporters:false,items:['fit','stretch','crop']},
          memoryModes: {acceptReporters:false,items:[{text:'automatic',value:'automatic'},{text:'manual',value:'manual'},{text:'off',value:'off'}]},
          destinations: {acceptReporters:false,items:[{text:'costume',value:'costume'},{text:'backdrop',value:'backdrop'}]}
        }
      };
    }
    setApiKey({KEY}) { this.apiKey=String(KEY).trim(); this.errorText=''; }
    chooseModel({MODEL}) {this.model=String(MODEL);}
    setCustomModel({MODEL}) {this.customModel=String(MODEL).trim();}
    setImageModel({MODEL}) {this.imageModel=String(MODEL).trim() || 'gpt-image-2';}
    getImageModel() {return this.imageModel;}
    setImageSize({SIZE}) {
      if(['1024x1024','1536x1024','1024x1536'].includes(String(SIZE))) {
        this.imageSize=String(SIZE); this.customImageSize=''; this.errorText='';
      } else this.errorText='Invalid preset image size.';
    }
    _dimensions(raw) {
      const m=/^\s*(\d+)\s*[xX×]\s*(\d+)\s*$/.exec(String(raw));
      if (!m) throw new Error('Invalid image size. Use WIDTHxHEIGHT, for example 480x360.');
      const w=Number(m[1]),h=Number(m[2]);
      if (!Number.isSafeInteger(w)||!Number.isSafeInteger(h)||w<1||h<1||w>4096||h>4096||w*h>16777216)
        throw new Error('Image dimensions must be between 1 and 4096 pixels, with at most 16 million pixels total.');
      return {w,h,size:`${w}x${h}`};
    }
    _setDim(field,raw) {
      try {this[field]=this._dimensions(raw).size;this.errorText='';return true;}
      catch(err) {this.errorText=err.message;this.success=false;return false;}
    }
    setCustomImageSize({SIZE}) {this._setDim('customImageSize',SIZE);}
    clearCustomImageSize() {this.customImageSize='';this.errorText='';}
    getImageSize() {return this.resizeImageSize||this.customImageSize||this.imageSize;}
    customSizeActive() {return !!this.customImageSize;}
    setResizeImage({SIZE}) {this._setDim('resizeImageSize',SIZE);}
    clearResizeImage() {this.resizeImageSize='';this.errorText='';}
    setResizeMode({MODE}) {if(['fit','stretch','crop'].includes(MODE)) this.resizeMode=MODE;}
    _apiImageSize(targetSize) {
      if(['1024x1024','1536x1024','1024x1536'].includes(targetSize))return targetSize;
      const {w,h}=this._dimensions(targetSize);
      if(w>h*1.15)return '1536x1024';
      if(h>w*1.15)return '1024x1536';
      return '1024x1024';
    }
    async _resizeBase64(base64,w,h,mode) {
      if(typeof document==='undefined'||typeof Image==='undefined') throw new Error('Browser canvas is unavailable for image resizing.');
      const img=new Image();
      await new Promise((resolve,reject)=>{
        img.onload=resolve;img.onerror=()=>reject(new Error('Could not decode generated image.'));
        img.src='data:image/png;base64,'+base64;
      });
      const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
      const ctx=canvas.getContext('2d');
      if(!ctx)throw new Error('Canvas 2D is unavailable.');
      ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
      if(mode==='stretch')ctx.drawImage(img,0,0,w,h);
      else {
        const scale=(mode==='crop'?Math.max:Math.min)(w/img.naturalWidth,h/img.naturalHeight);
        const dw=img.naturalWidth*scale,dh=img.naturalHeight*scale;
        ctx.drawImage(img,(w-dw)/2,(h-dh)/2,dw,dh);
      }
      return canvas.toDataURL('image/png').split(',')[1];
    }
    setImageQuality({QUALITY}) {if(['auto','low','medium','high'].includes(String(QUALITY))) this.imageQuality=String(QUALITY);}
    isGenerating() {return this.activeRequests>0;}
    resetMood() {this.moodText='You are an expert in PenguinMod.';}
    setLength({COUNT}) {this.maxTokens=Math.max(16,Math.min(4096,Math.floor(Number(COUNT)||200)));}
    setMood({MOOD}) {this.moodText=String(MOOD);}
    getMood() {return this.moodText;}
    setMemoryMode({MODE}) {if(['automatic','manual','off'].includes(MODE))this.mode=MODE;}
    addMemory({TEXT}) {this.history.push({role:'note',content:String(TEXT)});}
    getMemory() {return JSON.stringify(this.history);}
    clearMemory() {this.history=[];}
    saveMemory() {this.savedHistory=JSON.parse(JSON.stringify(this.history));}
    loadMemory() {this.history=JSON.parse(JSON.stringify(this.savedHistory));}
    getAnswer() {return this.answerText;}
    lastError() {return this.errorText;}
    isSuccessful() {return this.success;}
    // PenguinMod project storage: only saved snapshot is serialized; no keys are serialized.
    serialize() {return {savedHistory:this._safeHistory(this.savedHistory),memoryMode:this.mode,mood:this.moodText};}
    _safeHistory(items) {return Array.isArray(items) ? items.filter(x=>x && ['user','assistant','note'].includes(x.role) && typeof x.content==='string').slice(-100).map(x=>({role:x.role,content:x.content.slice(0,4000)})) : [];}
    deserialize(data) {
      this.savedHistory=this._safeHistory(data?.savedHistory);
      this.history=this._safeHistory(this.savedHistory);
      if(['automatic','manual','off'].includes(data?.memoryMode)) this.mode=data.memoryMode;
      if(typeof data?.mood==='string') this.moodText=data.mood.slice(0,4000);
    }
    async testConnection() {
      this.success=false;this.errorText='';this.activeRequests++;
      try {
        if(!this.apiKey) throw new Error('Set API key first.');
        const res=await fetch('https://api.openai.com/v1/models', {headers:{Authorization:'Bearer '+this.apiKey}});
        const json=await res.json().catch(()=>({}));
        if(!res.ok) throw new Error(json.error?.message || 'OpenAI returned HTTP '+res.status);
        this.success=true;
      } catch(err) {this.errorText=String(err.message||err);}
      finally {this.activeRequests--;}
    }
    async _post(path,payload) {
      if (!this.apiKey) throw new Error('Set an API key first. Do not save it in a shared project.');
      let res;
      try {
        res=await fetch('https://api.openai.com/v1/'+path, {
          method:'POST',
          headers:{'Content-Type':'application/json','Authorization':'Bearer '+this.apiKey},
          body:JSON.stringify(payload)
        });
      } catch(err) {
        throw new Error('Cannot reach OpenAI from the browser (network/CORS issue): '+String(err.message||err));
      }
      const obj=await res.json().catch(()=>({}));
      if (!res.ok) throw new Error(obj.error?.message || 'OpenAI returned HTTP '+res.status);
      return obj;
    }
    async _ask(text) {
      this.success=false; this.errorText='';this.activeRequests++;
      try {
        const model=this.model==='Custom'?this.customModel:this.model;
        const conversation=this.mode==='off'?[]:this.history;
        const messages=[{role:'system',content:this.moodText}];
        for(const item of conversation.slice(-40)) {
          if(item.role==='note') messages.push({role:'system',content:'Remember: '+item.content.slice(0,4000)});
          else if(['user','assistant'].includes(item.role)) messages.push({role:item.role,content:item.content.slice(0,4000)});
        }
        messages.push({role:'user',content:text});
        const result=await this._post('chat/completions',{model,messages,max_completion_tokens:this.maxTokens});
        this.answerText=String(result.choices?.[0]?.message?.content||'');
        if(this.mode==='automatic') {
          this.history.push({role:'user',content:text},{role:'assistant',content:this.answerText});
        }
        this.success=true;
        return this.answerText;
      }catch(err){this.errorText=String(err.message||err);return '';}
      finally {this.activeRequests--;}
    }
    async ask({PROMPT}) {return this._ask(String(PROMPT));}
    async askAndWait({PROMPT}) {await this._ask(String(PROMPT));}
    async generateImage({PROMPT,DEST},util) {
      this.success=false;this.errorText='';this.activeRequests++;
      try {
        if (!Scratch.extensions.unsandboxed || !Scratch.vm) throw new Error('Image import requires unsandboxed mode');
        const vm=Scratch.vm;
        const target=DEST==='backdrop'?vm.runtime.getTargetForStage():util.target;
        if(!target) throw new Error('Target sprite or stage not found');
        const requestedSize=this.resizeImageSize||this.customImageSize||this.imageSize;
        const dims=this._dimensions(requestedSize);
        const apiSize=this._apiImageSize(this.customImageSize||this.imageSize);
        const result=await this._post('images/generations',{model:this.imageModel,prompt:String(PROMPT),size:apiSize,quality:this.imageQuality,n:1});
        let b64=result.data?.[0]?.b64_json;
        if(!b64) throw new Error('OpenAI returned no PNG image');
        if(dims.size!==apiSize || this.resizeMode!=='fit') {
          b64=await this._resizeBase64(b64,dims.w,dims.h,this.resizeMode);
        }
        const raw=atob(b64);
        const bytes=new Uint8Array(raw.length);
        for(let i=0;i<raw.length;i++) bytes[i]=raw.charCodeAt(i);
        const storage=vm.runtime.storage;
        if(!storage?.createAsset) throw new Error('PenguinMod asset storage is unavailable');
        const asset=storage.createAsset(storage.AssetType.ImageBitmap,storage.DataFormat.PNG,bytes,null,true);
        const md5ext=asset.assetId+'.png';
        const costume={name:'AI '+Date.now(),asset,assetId:asset.assetId,md5ext,dataFormat:'png',bitmapResolution:1,rotationCenterX:Math.floor(dims.w/2),rotationCenterY:Math.floor(dims.h/2)};
        if (DEST==='backdrop') await vm.addBackdrop(md5ext,costume);
        else await vm.addCostume(md5ext,costume,target.id);
        this.success=true;
      }catch(err){this.errorText=String(err.message||err);}
      finally {this.activeRequests--;}
    }
  }
  Scratch.extensions.register(new OpenAIExtension());
})(Scratch);
