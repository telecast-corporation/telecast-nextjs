# Telecast Recording Service

A comprehensive audio recording and editing service integrated into Telecast.

## Features

### 🎙️ Audio Recording
- **Real-time recording** with microphone access
- **High-quality audio** capture (WebM format with Opus codec)
- **Noise suppression** and echo cancellation
- **Recording controls** (start, stop, pause, resume)

### 🎵 Audio Playback
- **Built-in audio player** with waveform visualization
- **Playback controls** (play, pause, stop, seek)
- **Volume control** and playback speed adjustment
- **Time display** and progress tracking

### 📝 Recording Management
- **Save recordings** with title, description, and tags
- **Organize recordings** with search and filtering
- **Public/private** recording visibility
- **Download recordings** in WebM format
- **Delete recordings** with confirmation

### 🎛️ Audio Editing (Basic)
- **Audio editor interface** with waveform display
- **Playback rate control** (0.5x to 2x speed)
- **Volume normalization**
- **Basic editing tools** (placeholder for future features)

## Pages & Components

### `/record` - Recording Page
- **AudioRecorder component** for recording new audio
- **Real-time recording** with visual feedback
- **Save dialog** with metadata input
- **Local playback** of recorded audio

### `/recordings` - Recordings List
- **Grid view** of all user recordings
- **Search functionality** by title, description, or tags
- **Filter options** (all, public, private)
- **Pagination** for large collections
- **Quick actions** (play, edit, download, delete)

### `/recordings/[id]` - Individual Recording
- **Detailed view** of a specific recording
- **Audio player** with full controls
- **Metadata display** (title, description, tags, stats)
- **Edit functionality** (coming soon)

## API Endpoints

### `POST /api/recordings`
Upload a new recording with metadata.

**Request:**
```javascript
const formData = new FormData();
formData.append('title', 'My Recording');
formData.append('description', 'Description here');
formData.append('tags', 'tag1,tag2,tag3');
formData.append('audio', audioBlob, 'recording.webm');
```

### `GET /api/recordings`
Fetch user recordings with pagination and filtering.

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `public` - Filter by public status ('true'/'false')
- `userId` - Filter by specific user

### `GET /api/recordings/[id]`
Fetch a specific recording by ID.

### `PUT /api/recordings/[id]`
Update recording metadata.

### `DELETE /api/recordings/[id]`
Delete a recording.

## Database Schema

```prisma
model Recording {
  id          String   @id @default(cuid())
  title       String
  description String?
  audioUrl    String
  duration    Int      @default(0)
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  tags        String[]
  isPublic    Boolean  @default(false)
  views       Int      @default(0)
  likes       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
  @@index([title])
  @@index([tags])
  @@index([isPublic])
  @@index([createdAt])
}
```

## File Storage

Recordings are stored in the `public/uploads/recordings/` directory with the following naming convention:
```
{userId}_{timestamp}_{title}.webm
```

## Authentication

All recording endpoints require authentication. Users can only:
- View their own recordings (unless public)
- Edit/delete their own recordings
- Upload recordings to their account

## Future Enhancements

### Advanced Audio Editing
- **Waveform editing** with visual timeline
- **Audio trimming** and splitting
- **Audio effects** (reverb, echo, filters)
- **Noise reduction** and audio enhancement
- **Multiple track mixing**

### Collaboration Features
- **Shared recordings** with specific users
- **Recording comments** and feedback
- **Collaborative editing** sessions
- **Recording templates** and presets

### Integration Features
- **Export to podcast episodes**
- **Direct upload to music platforms**
- **Audio transcription** services
- **Voice-to-text** conversion

## Usage

1. **Navigate to `/record`** to start recording
2. **Click "Record"** and allow microphone access
3. **Record your audio** and click "Stop" when done
4. **Click "Save Recording"** to add metadata
5. **View your recordings** at `/recordings`
6. **Edit or download** recordings as needed

## Technical Notes

- Uses **Web Audio API** for real-time audio processing
- **MediaRecorder API** for audio capture
- **Canvas API** for waveform visualization
- **File API** for audio file handling
- **Prisma ORM** for database operations
- **NextAuth.js** for authentication

## Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support (iOS 14.3+)
- **Mobile browsers**: Limited support for recording

## Security Considerations

- **File upload validation** for audio files
- **User authentication** required for all operations
- **File size limits** to prevent abuse
- **Secure file storage** with proper permissions
- **Input sanitization** for metadata fields 