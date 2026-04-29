// "use client";

// import { useEffect, useState } from "react";
// import {
//   collection,
//   query,
//   where,
//   onSnapshot,
//   addDoc,
//   doc,
//   updateDoc,
// } from "firebase/firestore";
// import { db } from "@/lib/firebase";
// import { createPeerConnection } from "@/lib/webrtc";
// import { useCallContext } from "@/contexts/CallContext";

// export const useIncomingCallManager = (user: any) => {
//   const [incomingCall, setIncomingCall] = useState<any>(null);
//   const { pcRef, localVideoRef, remoteVideoRef, iceQueueRef, setActiveCall } = useCallContext();

//   useEffect(() => {
//     if (!user) return;

//     const q = query(
//       collection(db, "calls"),
//       where("receiverId", "==", user.uid),
//       where("status", "==", "ringing")
//     );

//     const unsub = onSnapshot(q, (snapshot) => {
//       const callDoc = snapshot.docs[0];

//       if (callDoc) {
//         setIncomingCall({
//           ...callDoc.data(),
//           id: callDoc.id,
//         });
//       } else {
//         setIncomingCall(null);
//       }
//     });

//     return () => unsub();
//   }, [user]);

//   const acceptCall = async () => {
//     if (!incomingCall?.offer?.sdp) {
//       console.error("Invalid offer");
//       return;
//     }

//     // Clean up old peer connection
//     if (pcRef.current) {
//       pcRef.current.close();
//     }

//     pcRef.current = createPeerConnection();
//     const pc = pcRef.current;

//     setActiveCall({ id: incomingCall.id, role: "receiver" });

//     pc.onconnectionstatechange = () => {
//       console.log("Connection State:", pc.connectionState);
//     };

//     pc.oniceconnectionstatechange = () => {
//       console.log("ICE State:", pc.iceConnectionState);
//     };

//     pc.ontrack = (event) => {
//       if (!remoteVideoRef.current) return;
//       if (!remoteVideoRef.current.srcObject) {
//         remoteVideoRef.current.srcObject = new MediaStream();
//       }
//       (remoteVideoRef.current.srcObject as MediaStream).addTrack(event.track);
//     };

//     const callRef = doc(db, "calls", incomingCall.id);
//     const offerCandidates = collection(callRef, "offerCandidates");
//     const answerCandidates = collection(callRef, "answerCandidates");

//     pc.onicecandidate = async (event) => {
//       if (event.candidate) {
//         await addDoc(answerCandidates, event.candidate.toJSON());
//       }
//     };

//     onSnapshot(offerCandidates, (snapshot) => {
//       snapshot.docChanges().forEach(async (change) => {
//         if (change.type === "added") {
//           const candidate = new RTCIceCandidate(change.doc.data());

//           if (pc.remoteDescription) {
//             await pc.addIceCandidate(candidate);
//           } else {
//             iceQueueRef.current.push(candidate);
//           }
//         }
//       });
//     });

//     const stream = await navigator.mediaDevices.getUserMedia({
//       video: true,
//       audio: true,
//     });

//     if (localVideoRef.current) {
//       localVideoRef.current.srcObject = stream;
//     }

//     stream.getTracks().forEach((track) => {
//       pc.addTrack(track, stream);
//     });

//     await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));

//     for (const candidate of iceQueueRef.current) {
//       await pc.addIceCandidate(candidate);
//     }
//     iceQueueRef.current = [];

//     const answer = await pc.createAnswer();
//     await pc.setLocalDescription(answer);

//     await updateDoc(callRef, {
//       answer: {
//         type: answer.type,
//         sdp: answer.sdp,
//       },
//       status: "accepted",
//     });
//   };

//   return {
//     incomingCall,
//     acceptCall,
//     localVideoRef,
//     remoteVideoRef,
//   };
// };


"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { createPeerConnection } from "@/lib/webrtc";
import { useCallContext } from "@/contexts/CallContext";

export const useIncomingCallManager = (user: any) => {
  // STATE
  const [incomingCall, setIncomingCall] = useState<any>(null);

  // Get shared references from CallContext instead of creating local ones
  const { pcRef, localVideoRef, remoteVideoRef, iceQueueRef, setActiveCall } = useCallContext();

  // LISTEN FOR INCOMING CALLS
  useEffect(() => {
    if (!user) return;

    // 1) Query Firestore for calls where this user is the receiver and status is "ringing"
    const q = query(
      collection(db, "calls"),
      where("receiverId", "==", user.uid),
      where("status", "==", "ringing")
    );

    // 2) Set up real-time listener to get incoming calls
    const unsub = onSnapshot(q, (snapshot) => {
      const callDoc = snapshot.docs[0];

      if (callDoc) {
        // 3) Extract call data AND document ID (important for later updates)
        setIncomingCall({
          ...callDoc.data(),
          id: callDoc.id,
        });
      } else {
        // 4) If no incoming calls, clear the state
        setIncomingCall(null);
      }
    });

    return () => unsub();
  }, [user]);

  // ACCEPT CALL (CALLEE/RECEIVER SIDE)
  const acceptCall = async () => {
    // 0) Validate that we have a valid offer with SDP
    if (!incomingCall?.offer?.sdp) {
      console.error("Invalid offer");
      return;
    }

    // 1) Close any existing peer connection to avoid resource leaks
    if (pcRef.current) {
      pcRef.current.close();
    }

    // 2) Create a NEW peer connection (shared via context)
    pcRef.current = createPeerConnection();
    const pc = pcRef.current;

    // 3) Mark this call as active with role "receiver"
    setActiveCall({ id: incomingCall.id, role: "receiver" });

    // 4) Monitor peer connection state changes
    pc.onconnectionstatechange = () => {
      console.log("Connection State:", pc.connectionState);
    };

    // 5) Monitor ICE connection state changes
    pc.oniceconnectionstatechange = () => {
      console.log("ICE State:", pc.iceConnectionState);
    };

    // 6) Handle incoming remote tracks (video/audio from caller)
    pc.ontrack = (event) => {
      // Only process if we have a video element reference
      if (!remoteVideoRef.current) return;

      // Create empty MediaStream if it doesn't exist yet
      if (!remoteVideoRef.current.srcObject) {
        remoteVideoRef.current.srcObject = new MediaStream();
      }

      // Add the remote track to the video stream
      (remoteVideoRef.current.srcObject as MediaStream).addTrack(event.track);
    };

    // 7) Reference to the call document in Firestore
    const callRef = doc(db, "calls", incomingCall.id);

    // 8) Collections for ICE candidates
    const offerCandidates = collection(callRef, "offerCandidates");
    const answerCandidates = collection(callRef, "answerCandidates");

    // 9) Send our ICE candidates to Firestore (caller will receive these)
    pc.onicecandidate = async (event) => {
      if (event.candidate) {
        await addDoc(answerCandidates, event.candidate.toJSON());
      }
    };

    // 10) Listen for ICE candidates from the caller
    onSnapshot(offerCandidates, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === "added") {
          const candidate = new RTCIceCandidate(change.doc.data());

          // If remote description is already set, add candidate immediately
          if (pc.remoteDescription) {
            await pc.addIceCandidate(candidate);
          } else {
            // Otherwise, queue it for later
            iceQueueRef.current.push(candidate);
          }
        }
      });
    });

    // 11) Get local media (camera + microphone)
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    // 12) Display local video in the video element
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    // 13) Add local media tracks to peer connection (send to caller)
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    // 14) Set the caller's offer as our remote description
    // This tells our peer connection what the caller wants to send
    await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));

    // 15) Now that remote description is set, add any queued ICE candidates
    for (const candidate of iceQueueRef.current) {
      await pc.addIceCandidate(candidate);
    }
    iceQueueRef.current = [];

    // 16) Create our answer (response to the caller's offer)
    const answer = await pc.createAnswer();

    // 17) Set our answer as the local description
    // This tells our peer connection what we want to send
    await pc.setLocalDescription(answer);

    // 18) Save the answer back to Firestore so the caller receives it
    // Also update call status to "accepted"
    await updateDoc(callRef, {
      answer: {
        type: answer.type,
        sdp: answer.sdp,
      },
      status: "accepted",
    });
  };

  return {
    incomingCall,
    acceptCall,
    localVideoRef,
    remoteVideoRef,
  };
};
