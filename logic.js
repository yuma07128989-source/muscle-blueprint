(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.MBLogic=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
const parts=['胸','背中','肩','脚','腕'];
const types=[{key:'A',name:'ボリューム過多',tip:'対象部位のセット数と疲労の関係を確認し、必要なら段階的に減らしましょう。'},{key:'B',name:'ボリューム不足・偏り',tip:'対象部位の直接セット数と頻度を見直し、回復状況を確認しながら調整しましょう。'},{key:'C',name:'プログラム設計のミスマッチ',tip:'週の実施回数に合わせて分割法・種目の優先順位を整理しましょう。'},{key:'D',name:'回復不足の可能性',tip:'睡眠時間、疲労、休息日を確認し、必要なら負荷を調整しましょう。'},{key:'E',name:'フォーム・出力の追加確認',tip:'フォーム動画や可動域、対象筋への負荷のかかり方を確認しましょう。'}];
function score(v){
 const s=[0,0,0,0,0], values=parts.map(p=>Math.max(0,Number(v.sets[p])||0));
 const high=values.filter(n=>n>=16).length, low=values.filter(n=>n<=9).length;
 const total=values.reduce((a,b)=>a+b,0),freq=Number(v.freq),split=Number(v.split),fatigue=Number(v.fatigue);
 // 各部位の直接セット数を評価。部位の重複計上を避けるため総量は補助指標。
 parts.forEach((p,i)=>{
   const n=values[i], w=v.weak===p?1.5:1;
   if(n<=5)s[1]=Math.max(s[1],30*w);
   else if(n<=9)s[1]=Math.max(s[1],15*w);
   else if(n>=21)s[0]=Math.max(s[0],25*w);
   else if(n>=16)s[0]=Math.max(s[0],10*w);
 });
 if(high>=2)s[0]+=Math.min(25,(high-1)*6);
 if(low>=2)s[1]+=Math.min(20,(low-1)*5);
 if(high>=4&&total>=80)s[0]+=10;
 if(s[0]>0&&v.history==='1年未満')s[0]+=10;
 if(s[0]>0&&fatigue>=4)s[0]+=15;
 // 4回/週・4分割は、それだけではミスマッチとしない。
 if(freq<=2&&split>=4)s[2]+=30;
 else if(freq===3&&split>=5)s[2]+=20;
 if(!String(v.main||'').trim())s[2]+=10;
 if(Number(v.sleep)<6&&fatigue>=4)s[3]+=35;
 else if(Number(v.sleep)<6||fatigue>=4)s[3]+=15;
 if(/刺激|効かない|フォーム|他の部位|出力|感覚|狙った筋/.test(v.concern||''))s[4]+=25;
 if(v.weak!=='なし'&&s[4]===0&&values[parts.indexOf(v.weak)]>=10&&values[parts.indexOf(v.weak)]<=15)s[4]+=10;
 const ranked=types.map((t,i)=>({...t,score:Math.min(100,Math.round(s[i]))})).sort((a,b)=>b.score-a.score);
 const radar=[
  Math.max(0,100-(freq<=2?35:freq>=6?10:0)),
  Math.max(0,100-Math.min(85,Math.max(s[0],s[1]))),
  Math.max(0,100-Math.min(70,s[2]+s[4]/2)),
  Math.max(0,100-Math.min(70,s[3]+(fatigue>=4?15:0))),
  Math.max(0,100-Math.min(70,s[2]+(v.weak!=='なし'?10:0)))
 ].map(Math.round);
 return {ranked,radar,needsReview:ranked[0].score===0,
  context:`トレーニング歴：${v.history}／大会経験：${v.contest}／週${freq}回・${split}分割／5部位合計：${total}セット（各部位の直接セット数）`,
  version:'0.2'};
}
return {score,parts,types};
});
