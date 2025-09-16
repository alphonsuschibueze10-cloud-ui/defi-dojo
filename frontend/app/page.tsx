export default function HomePage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem', textAlign: 'center' }}>
        🥋 DeFi Dojo
      </h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem', textAlign: 'center', maxWidth: '600px' }}>
        Sharpen Your DeFi Skills. Earn XP. Master Bitcoin.
      </p>
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.1)', 
        padding: '2rem', 
        borderRadius: '10px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <h2 style={{ marginBottom: '1rem' }}>🎯 Status</h2>
        <p>✅ Frontend: Deployed on Vercel</p>
        <p>✅ Backend: <a href="https://defi-dojo.onrender.com" style={{ color: '#4ade80' }}>https://defi-dojo.onrender.com</a></p>
        <p>✅ API: Working and connected</p>
        <p>🚀 Ready for DeFi training!</p>
      </div>
      <div style={{ marginTop: '2rem' }}>
        <a 
          href="/dashboard" 
          style={{ 
            background: '#4ade80', 
            color: 'white', 
            padding: '12px 24px', 
            borderRadius: '8px', 
            textDecoration: 'none',
            fontWeight: 'bold',
            display: 'inline-block'
          }}
        >
          Enter Dojo →
        </a>
      </div>
    </div>
  )
}