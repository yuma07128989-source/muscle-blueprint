(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.MBLogic=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
const parts=['胸','背中','肩','脚','腕'];
const types=[{key:'A',name:'ボリューム過多',tip:'30セット以上の部位を中心に、RIR・疲労・睡眠・パフォーマンス推移を確認しましょう。セット数だけで過多とは断定しません。'},{key:'B',name:'ボリューム不足・偏り',tip:'対象部位の直接セット数と頻度を見直し、回復状況を確認しながら調整しましょう。'},{key:'C',name:'プログラム設計のミスマッチ',tip:'週の実施回数に合わせて分割法・種目の優先順位を整理しましょう。'},{key:'D',name:'回復不足の可能性',tip:'睡眠時間、疲労、休息日を確認し、必要なら負荷を調整しましょう。'},{key:'E',name:'フォーム・出力の追加確認',tip:'フォーム動画や可動域、対象筋への負荷のかかり方を確認しましょう。'}];
 function score(v){
  const s=[0,0,0,0,0], details=[], values=parts.map(p=>Math.max(0,Number(v.sets[p])||0));
  const fatigue=Number(v.fatigue), sleep=Number(v.sleep), freq=Number(v.freq), split=Number(v.split);
  const rir=String(v.rir||'unknown'), trend=String(v.trend||'unknown');
  const poorRecovery=fatigue>=4||sleep<6, decline=trend==='down', goodTrend=trend==='up';
  parts.forEach((p,i)=>{
    const n=values[i],w=v.weak===p?1.3:1;
    let over=0,under=0,status='目安の範囲';
    if(n<=5){under=30;status='不足の可能性（追加確認）'}
    else if(n<=9){under=15;status='やや少なめ'}
    else if(n<=20){status='基本的な目安'}
    else if(n<=29){status='やや多め・経過確認'}
    else if(n<=39){
      status='30セット以上：強度・回復を要確認';
      over=8;
      if(rir==='0-1')over+=8;
      if(poorRecovery)over+=10;
      if(decline)over+=12;
      if(goodTrend&&!poorRecovery)over=Math.max(0,over-8);
    }else{
      status='40セット以上：過多を強く疑い詳細確認';
      over=32;
      if(rir==='0-1')over+=8;
      if(poorRecovery)over+=12;
      if(decline)over+=15;
      if(goodTrend&&!poorRecovery)over=Math.max(20,over-8);
    }
    s[0]=Math.max(s[0],Math.round(over*w));
    s[1]=Math.max(s[1],Math.round(under*w));
    details.push({part:p,sets:n,status});
  });
  // 部位別評価が基本。総セット数や20セットの部位数だけで過多加点しない。
  if(freq<=2&&split>=4)s[2]+=30;
  else if(freq===3&&split>=5)s[2]+=20;
  if(sleep<6&&fatigue>=4)s[3]+=35;
  else if(sleep<6||fatigue>=4)s[3]+=15;
  if(decline&&poorRecovery)s[3]+=15;
  if(/刺激|効かない|フォーム|他の部位|出力|感覚|狙った筋/.test(v.concern||''))s[4]+=25;
  const ranked=types.map((t,i)=>({...t,score:Math.min(100,Math.round(s[i]))})).sort((a,b)=>b.score-a.score);
  const radar=[
   Math.max(0,100-(freq<=2?35:freq>=6?10:0)),
   Math.max(0,100-Math.min(85,Math.max(s[0],s[1]))),
   Math.max(0,100-Math.min(70,s[2]+s[4]/2)),
   Math.max(0,100-Math.min(70,s[3]+(fatigue>=4?15:0))),
   Math.max(0,100-Math.min(70,s[2]+(v.weak!=='なし'?10:0)))
  ].map(Math.round);
  const total=values.reduce((a,b)=>a+b,0);
  return {ranked,radar,details,needsReview:ranked[0].score===0,
   context:`トレーニング歴：${v.history}／大会経験：${v.contest}／週${freq}回・${split}分割／5部位合計：${total}セット（参考値・過多判定には使用しません）／RIR：${rir}／直近4週間：${trend}`,
   version:'0.4'};
 }
return {score,parts,types};
});
