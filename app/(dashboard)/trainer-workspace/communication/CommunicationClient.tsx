'use client'

import { useState } from 'react';

type Communication = {
  id: string;
  subject: string;
  body: string;
  type: string;
  created_at: string;
  course_id?: string;
  course_name?: string;
  recipient_name?: string;
};

export default function CommunicationClient({ courses, learners }: { courses: any[], learners: any[] }) {
  const [activeTab, setActiveTab] = useState<'announcements' | 'messages'>('announcements');
  const [isComposing, setIsComposing] = useState(false);
  const [communications, setCommunications] = useState<Communication[]>([]);
  
  // Form State
  const [composeType, setComposeType] = useState<'announcement' | 'direct_message'>('announcement');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [composeCourseId, setComposeCourseId] = useState('');
  const [composeRecipientId, setComposeRecipientId] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newComm: Communication = {
      id: Math.random().toString(36).substr(2, 9),
      subject: composeSubject,
      body: composeBody,
      type: composeType,
      created_at: new Date().toISOString(),
      course_id: composeType === 'announcement' ? composeCourseId : undefined,
      course_name: composeType === 'announcement' ? courses.find(c => c.id === composeCourseId)?.programme_name : undefined,
      recipient_name: composeType === 'direct_message' ? learners.find(l => l.id === composeRecipientId)?.name : undefined,
    };
    
    setCommunications([newComm, ...communications]);
    setIsComposing(false);
    setComposeSubject('');
    setComposeBody('');
  };

  const filteredComms = communications.filter(c => 
    activeTab === 'announcements' ? c.type === 'announcement' : c.type === 'direct_message'
  );

  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[600px]">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 border-r bg-gray-50 flex flex-col">
        <div className="p-4 border-b">
          <button 
            onClick={() => setIsComposing(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded shadow-sm flex justify-center items-center"
          >
            <span className="mr-2">✏️</span> Compose
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          <button 
            onClick={() => { setActiveTab('announcements'); setIsComposing(false); }}
            className={`w-full text-left px-6 py-3 text-sm font-medium flex items-center ${activeTab === 'announcements' && !isComposing ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            📢 Announcements
          </button>
          <button 
            onClick={() => { setActiveTab('messages'); setIsComposing(false); }}
            className={`w-full text-left px-6 py-3 text-sm font-medium flex items-center ${activeTab === 'messages' && !isComposing ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            ✉️ Direct Messages
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-white">
        {isComposing ? (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Compose New Message</h2>
            <form onSubmit={handleSend} className="space-y-6">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message Type</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input type="radio" checked={composeType === 'announcement'} onChange={() => setComposeType('announcement')} className="text-blue-600 focus:ring-blue-500 mr-2" />
                    Course Announcement
                  </label>
                  <label className="flex items-center">
                    <input type="radio" checked={composeType === 'direct_message'} onChange={() => setComposeType('direct_message')} className="text-blue-600 focus:ring-blue-500 mr-2" />
                    Direct Message
                  </label>
                </div>
              </div>

              {composeType === 'announcement' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Course</label>
                  <select required value={composeCourseId} onChange={e => setComposeCourseId(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm px-3 py-2 border focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Select a course...</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>{course.programme_name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recipient</label>
                  <select required value={composeRecipientId} onChange={e => setComposeRecipientId(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm px-3 py-2 border focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Select a learner...</option>
                    {learners.map(learner => (
                      <option key={learner.id} value={learner.id}>{learner.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input required type="text" value={composeSubject} onChange={e => setComposeSubject(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm px-3 py-2 border focus:ring-blue-500 focus:border-blue-500" placeholder="Message Subject" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message Body</label>
                <textarea required rows={6} value={composeBody} onChange={e => setComposeBody(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm px-3 py-2 border focus:ring-blue-500 focus:border-blue-500" placeholder="Type your message here..."></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button type="button" onClick={() => setIsComposing(false)} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 flex items-center">
                  Send Message
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-semibold text-gray-800">
                {activeTab === 'announcements' ? 'Course Announcements' : 'Direct Messages'}
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {filteredComms.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <div className="text-4xl mb-4">📭</div>
                  <p className="text-lg font-medium">No messages found</p>
                  <p className="text-sm">You haven't sent any {activeTab === 'announcements' ? 'announcements' : 'direct messages'} yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredComms.map(comm => (
                    <div key={comm.id} className="bg-white border rounded-lg p-4 shadow-sm hover:shadow transition">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-900">{comm.subject}</h3>
                        <span className="text-xs text-gray-500">{new Date(comm.created_at).toLocaleString()}</span>
                      </div>
                      <div className="mb-3 text-sm text-gray-500">
                        {comm.type === 'announcement' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            Course: {comm.course_name}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            To: {comm.recipient_name}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 text-sm whitespace-pre-wrap">{comm.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
