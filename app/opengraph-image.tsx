import { ImageResponse } from 'next/og';

export const alt = 'Fermidas - Trusted Compliance & Governance Advisory';
export const contentType = 'image/png';
export const size = {
  width: 1200,
  height: 630,
};

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #749694 0%, #141A1B 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
          position: 'relative',
        }}
      >
        {/* Background Pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'radial-gradient(circle at 20% 80%, rgba(116, 150, 148, 0.1) 0%, transparent 50%)',
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '40px',
          }}
        >
          {/* Fermidas Logo - Recreated from SVG */}
          <div
            style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '20px',
              border: '2px solid #749694',
              position: 'relative',
            }}
          >
            {/* F letter - Main vertical bar */}
            <div
              style={{
                position: 'absolute',
                left: '16px',
                top: '12px',
                width: '18px',
                height: '56px',
                backgroundColor: '#141A1B',
                borderRadius: '2px',
              }}
            />
            {/* F letter - Top horizontal bar */}
            <div
              style={{
                position: 'absolute',
                left: '34px',
                top: '12px',
                width: '30px',
                height: '30px',
                backgroundColor: '#749694',
                borderRadius: '2px',
              }}
            />
            {/* F letter - Top horizontal bar accent */}
            <div
              style={{
                position: 'absolute',
                left: '34px',
                top: '12px',
                width: '30px',
                height: '6px',
                backgroundColor: '#141A1B',
                borderRadius: '2px',
              }}
            />
            {/* F letter - Middle horizontal bar accent */}
            <div
              style={{
                position: 'absolute',
                left: '34px',
                top: '36px',
                width: '30px',
                height: '6px',
                backgroundColor: '#141A1B',
                borderRadius: '2px',
              }}
            />
          </div>
          <span
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#FFFFFF',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            FERMIDAS
          </span>
        </div>

        {/* Main Title */}
        <h1
          style={{
            fontSize: '64px',
            fontWeight: 'bold',
            color: '#FFFFFF',
            textAlign: 'center',
            margin: '0 0 20px 0',
            lineHeight: '1.2',
            maxWidth: '900px',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          Trusted Compliance & Governance Advisory
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: '28px',
            color: '#E5E7EB',
            textAlign: 'center',
            margin: '0 0 40px 0',
            maxWidth: '800px',
            lineHeight: '1.4',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          We help organisations thrive in complex regulatory environments with
          technical expertise and ethical leadership
        </p>

        {/* Bottom Bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '8px',
            background: 'linear-gradient(90deg, #749694 0%, #141A1B 100%)',
          }}
        />
      </div>
    ),
    {
      ...size,
    },
  );
}
