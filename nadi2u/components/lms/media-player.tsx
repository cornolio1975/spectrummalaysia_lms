"use client";

interface MediaPlayerProps {
  url: string;
  type: string; // 'video', 'pdf', 'audio', etc.
  title?: string;
}

export function MediaPlayer({ url, type, title }: MediaPlayerProps) {
  if (!url) {
    return (
      <div className="bg-gray-100 rounded-lg p-12 text-center border-2 border-dashed border-gray-300">
        <p className="text-gray-500">Media source is missing.</p>
      </div>
    );
  }

  // Handle Video
  if (type === 'video' || url.endsWith('.mp4') || url.endsWith('.webm')) {
    return (
      <div className="rounded-xl overflow-hidden shadow-lg bg-black">
        <video 
          controls 
          className="w-full max-h-[600px]"
          poster="/placeholder-video-poster.jpg" // You can pass this as a prop later
        >
          <source src={url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  // Handle PDF
  if (type === 'pdf' || url.endsWith('.pdf')) {
    return (
      <div className="rounded-xl overflow-hidden shadow-lg border h-[600px]">
        <object 
          data={url} 
          type="application/pdf" 
          width="100%" 
          height="100%"
        >
          <div className="p-8 text-center bg-gray-50 h-full flex flex-col items-center justify-center">
            <p className="mb-4 text-gray-600">Your browser doesn't have a built-in PDF viewer.</p>
            <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              Download PDF Instead
            </a>
          </div>
        </object>
      </div>
    );
  }

  // Handle Audio
  if (type === 'audio' || url.endsWith('.mp3')) {
    return (
      <div className="bg-gray-50 p-6 rounded-xl shadow border">
        {title && <h3 className="font-semibold mb-4 text-gray-800">{title}</h3>}
        <audio controls className="w-full">
          <source src={url} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      </div>
    );
  }

  // Handle YouTube or External links
  if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com')) {
    // Basic Youtube extraction (would need a more robust parser in prod)
    let embedUrl = url;
    if (url.includes('watch?v=')) embedUrl = url.replace('watch?v=', 'embed/');
    
    return (
      <div className="rounded-xl overflow-hidden shadow-lg border relative pt-[56.25%]">
        <iframe 
          className="absolute top-0 left-0 w-full h-full"
          src={embedUrl} 
          title={title || "Video player"} 
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen
        ></iframe>
      </div>
    );
  }

  // Fallback for unknown types or direct downloads
  return (
    <div className="bg-gray-50 p-8 rounded-xl shadow border text-center flex flex-col items-center">
      <div className="text-5xl mb-4">📁</div>
      <h3 className="font-bold text-gray-900 mb-2">{title || "Attached File"}</h3>
      <p className="text-gray-500 mb-6 text-sm max-w-md">
        This file format cannot be previewed directly in the browser. 
        You can download it using the link below.
      </p>
      <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-primary" download>
        Download File
      </a>
    </div>
  );
}
