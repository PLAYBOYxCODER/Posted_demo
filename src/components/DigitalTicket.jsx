import React from 'react';
import './DigitalTicket.css';

export default function DigitalTicket({ orderId, date, actualOrder }) {
  const itemCount = actualOrder?.items ? actualOrder.items.reduce((acc, item) => acc + item.quantity, 0) : 1;
  const grandTotal = actualOrder?.total || 799;
  const itemsText = actualOrder?.items ? actualOrder.items.map(i => `${i.quantity}x ${i.name}`).join(', ') : '1x Poster';
  
  const qrData = encodeURIComponent(`POSTER STORE RECEIPT\nOrder ID: ${orderId}\nDate: ${date}\nItems: ${itemsText}\nTotal Paid: ₹${grandTotal}\nStatus: Shipment Confirmed`);

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* Top glowing bar */}
      <div className="output mt-10 z-20">
        <div className="wrap-colors-1"><div className="bg-colors"></div></div>
        <div className="wrap-colors-2"><div className="bg-colors"></div></div>
        <div className="output-cover"></div>
      </div>

      <div className="area w-full max-w-sm mt-0 mx-auto z-10 scale-[0.85] sm:scale-100 origin-top">
        <div className="area-wrapper">
          <div className="ticket-mask">
            <div className="ticket pointer-events-auto cursor-pointer">
              <div className="ticket-flip-container">
                <div className="float">
                  
                  {/* FRONT */}
                  <div className="front">
                    <div className="ticket-body shadow-2xl">
                      <div className="reflex"></div>

                      <svg className="icon-cube" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path style={{'--i': 1}} className="path-center" d="M12 12.75L14.25 11.437M12 12.75L9.75 11.437M12 12.75V15" stroke="black" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"></path>
                        <path style={{'--i': 2}} className="path-t" d="M9.75 3.562L12 2.25L14.25 3.563" stroke="black" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"></path>
                        <path style={{'--i': 3}} className="path-tr" d="M21 7.5L18.75 6.187M21 7.5V9.75M21 7.5L18.75 8.813" stroke="black" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"></path>
                        <path style={{'--i': 4}} className="path-br" d="M21 14.25V16.5L18.75 17.813" stroke="black" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"></path>
                        <path style={{'--i': 5}} className="path-b" d="M12 21.75L14.25 20.437M12 21.75V19.5M12 21.75L9.75 20.437" stroke="black" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"></path>
                        <path style={{'--i': 6}} className="path-bl" d="M5.25 17.813L3 16.5V14.25" stroke="black" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"></path>
                        <path style={{'--i': 7}} className="path-tl" d="M3 7.5L5.25 6.187M3 7.5L5.25 8.813M3 7.5V9.75" stroke="black" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>

                      <header>
                        <div className="ticket-name">
                          <div>
                            <span style={{'--i': 1}}>P</span>
                            <span style={{'--i': 2}}>O</span>
                            <span style={{'--i': 3}}>S</span>
                            <span style={{'--i': 4}}>T</span>
                            <span style={{'--i': 5}}>E</span>
                            <span style={{'--i': 6}}>R</span>
                          </div>
                          <div>
                            <span className="bold" style={{'--i': 8}}>S</span>
                            <span className="bold" style={{'--i': 9}}>T</span>
                            <span className="bold" style={{'--i': 10}}>O</span>
                            <span className="bold" style={{'--i': 11}}>R</span>
                            <span className="bold" style={{'--i': 12}}>E</span>
                          </div>
                        </div>
                        <div className="barcode"></div>
                      </header>
                      
                      <div className="contents flex-col relative w-full px-6 text-left pb-4">
                        <div className="w-full border-b-2 border-dashed border-gray-400/50 pb-3 mb-3 z-10 relative mt-4">
                           <div className="flex justify-between text-sm mb-1">
                             <span className="font-bold text-gray-600 uppercase tracking-wider">Total Items</span>
                             <span className="font-black">{itemCount}x items</span>
                           </div>
                           <div className="flex justify-between text-sm mb-1">
                             <span className="font-bold text-gray-600 uppercase tracking-wider">Top Product</span>
                             <span className="font-black truncate max-w-[120px]" title={actualOrder?.items?.[0]?.name}>{actualOrder?.items?.[0]?.name || "Premium Poster"}</span>
                           </div>
                           <div className="flex justify-between text-sm">
                             <span className="font-bold text-gray-600 uppercase tracking-wider">Shipping</span>
                             <span className="font-black text-gray-800">FREE</span>
                           </div>
                        </div>
                        <div className="w-full flex justify-between items-center z-10 relative mb-8">
                           <span className="font-black uppercase tracking-[0.2em] text-gray-500 text-xs">Paid Total</span>
                           <span className="font-black text-3xl text-black">₹{grandTotal}</span>
                        </div>
                        
                        <div className="number">{orderId || '#001'}</div>
                      </div>
                    </div>
                  </div>

                  {/* BACK */}
                  <div className="back">
                    <div className="ticket-body shadow-2xl">
                      <div className="reflex"></div>
                      <header>
                        <div className="ticket-name">
                          <div>
                            <span style={{'--i': 1}}>P</span>
                            <span style={{'--i': 2}}>O</span>
                            <span style={{'--i': 3}}>S</span>
                            <span style={{'--i': 4}}>T</span>
                            <span style={{'--i': 5}}>E</span>
                            <span style={{'--i': 6}}>R</span>
                          </div>
                          <b>
                            <span className="bold" style={{'--i': 8}}>S</span>
                            <span className="bold" style={{'--i': 9}}>T</span>
                            <span className="bold" style={{'--i': 10}}>O</span>
                            <span className="bold" style={{'--i': 11}}>R</span>
                            <span className="bold" style={{'--i': 12}}>E</span>
                          </b>
                        </div>

                        <time>
                           {/* Simplified dynamic date view */}
                           <span className="bold text-xs" style={{'--i': 13}}>{date || '2026'}</span>
                        </time>
                      </header>
                      
                      <div className="contents flex-col gap-2 relative items-center justify-center pt-8">
                        <div className="qrcode text-center relative z-10 mt-6 bg-white p-2 rounded-xl shadow-lg border border-gray-200">
                          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${qrData}`} alt="QR" className="mx-auto" />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="noise">
        <svg height="100%" width="100%">
          <defs>
            <pattern height="500" width="500" patternUnits="userSpaceOnUse" id="noise-pattern">
              <filter y="0" x="0" id="noise">
                <feTurbulence stitchTiles="stitch" numOctaves="3" baseFrequency="0.65" type="fractalNoise"></feTurbulence>
                <feBlend mode="screen"></feBlend>
              </filter>
              <rect filter="url(#noise)" height="500" width="500"></rect>
            </pattern>
          </defs>
          <rect fill="url(#noise-pattern)" height="100%" width="100%"></rect>
        </svg>
      </div>

    </div>
  );
}
