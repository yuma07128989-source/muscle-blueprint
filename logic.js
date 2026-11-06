(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.MBLogic=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
const parts=['胸','背中','肩','脚','腕'];
const types=[{key:'A',name:'ボリューム過多',tip:'対象部位のセット数と疲労の関係を確認し、必要なら段階的に減らしましょう。'},{key:'B',name:'ボリューム不足・偏り',tip:'対象部位の直接セット数と頻度を見直し、回復状況を確認しながら調整しましょう。'},{key:'C',name:'プログラム設計のミスマッチ',tip:'週の実施回数に合わせて分割法・種目の優先順位を整理しましょう。'},{key:'D',name:'回復不足の可能性',tip:'睡眠時間、疲労、休息日を確認し、必要なら負荷を調整しましょう。'},{key:'E',name:'フォーム・出力の追加確認',tip:'フォーム動画や可動域、対象筋への負荷のかかり方を確認しましょう。'}];
function score(v){const s=[0,0,0,0,0];let low=0,high=0;parts.forEach(p=>{const n=Number(v.sets[p]);const w=v.weak===p?1.5:1;if(n<=5){low++;s[1]=Math.max(s[1],30*w)}else if(n<=9){low++;s[1]=Math.max(s[1],15*w)}else if(n>=21){high++;s[0]=Math.max(s[0],25*w)}else if(n>=16){high++;s[0]=Math.max(s[0],10*w)}});if(high>=2)s[0]+=10;if(low>=2)s[1]+=10;if(s[0]>0&&v.fatigue>=4)s[0]+=15;
const freq=Number(v.freq),split=Number(v.split);if(freq<=2&&split>=4)s[2]+=30;else if(freq===3&&split>=5)s[2]+=20;if(v.main.trim()==='')s[2]+=10;
if(Number(v.sleep)<6&&v.fatigue>=4)s[3]+=35;else if(Number(v.sleep)<6||v.fatigue>=4)s[3]+=15;
if(/刺激|効かない|フォーム|他の部位|出力|感覚|狙った筋/.test(v.concern))s[4]+=25;
if(v.weak!=='なし'&&s[4]===0&&Number(v.sets[v.weak])>=10&&Number(v.sets[v.weak])<=15)s[4]+=10;
// 経験・大会経験は診断文の文脈に使用。単独で病態や設計不良と断定しない。
const ranked=types.map((t,i)=>({...t,score:Math.min(100,Math.round(s[i]))})).sort((a,b)=>b.score-a.score);
const radar=[Math.max(0,100-(freq<=2?35:freq>=6?10:0)),Math.max(0,100-Math.min(70,Math.max(s[0],s[1]))),Math.max(0,100-Math.min(70,s[2]+s[4]/2)),Math.max(0,100-Math.min(70,s[3]+(v.fatigue>=4?15:0))),Math.max(0,100-Math.min(70,s[2]+(v.weak!=='なし'?10:0)))].map(Math.round);
return {ranked,radar,needsReview:ranked[0].score===0,context:`トレーニング歴：${v.history}／大会経験：${v.contest}`,version:'0.1'};}
return {score,parts,types};
});
