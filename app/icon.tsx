import { ImageResponse } from 'next/og';

export const contentType = 'image/png';
export const size = {
  width: 32,
  height: 32,
};

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#141A1B',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '6px',
        }}
      >
        <div
          style={{
            width: '20px',
            height: '20px',
            backgroundColor: '#749694',
            borderRadius: '4px',
          }}
        />
      </div>
    ),
    {
      ...size,
    },
  );
}
