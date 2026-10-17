import * as React from 'react';
import { headers } from 'next/headers';
import { PageClientImpl } from './PageClientImpl';
import { isVideoCodec } from '@/lib/types';
import { getLiveKitURL } from '@/lib/getLiveKitURL';

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ roomName: string }>;
  searchParams: Promise<{
    // FIXME: We should not allow values for regions if in playground mode.
    region?: string;
    hq?: string;
    codec?: string;
    singlePC?: string;
  }>;
}) {
  // ================= 微信环境服务器端拦截开始 =================
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  const isWechat = /MicroMessenger/i.test(userAgent);

  if (isWechat) {
    return (
      <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',backgroundColor:'rgba(0,0,0,0.9)',zIndex:99999,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:'white',textAlign:'center',padding:'20px'}}>
        <h1 style={{fontSize:'24px',marginBottom:'10px'}}>🛑 微信限制无法使用</h1>
        <p style={{fontSize:'18px',lineHeight:'1.5'}}>请点击屏幕右上角的 <strong>[···]</strong> 图标<br/>选择 <strong>"在默认浏览器中打开"</strong><br/>以正常使用麦克风和摄像头。</p>
      </div>
    );
  }
  // ================= 微信环境服务器端拦截结束 =================

  const _params = await params;
  const _searchParams = await searchParams;
  const codec =
    typeof _searchParams.codec === 'string' && isVideoCodec(_searchParams.codec)
      ? _searchParams.codec
      : 'vp9';
  const hq = _searchParams.hq === 'true' ? true : false;
  const singlePC = _searchParams.singlePC !== 'false';
  const serverUrl = process.env.LIVEKIT_URL
    ? getLiveKitURL(process.env.LIVEKIT_URL, _searchParams.region ?? null)
    : undefined;

  return (
    <PageClientImpl
      roomName={_params.roomName}
      serverUrl={serverUrl}
      region={_searchParams.region}
      hq={hq}
      codec={codec}
      singlePeerConnection={singlePC}
    />
  );
}
