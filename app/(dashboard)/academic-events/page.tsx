"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Calendar, ChevronLeft, Clock, MapPin, Plus, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AcademicEvent {
  id: string;
  title: string;
  description: string;
  eventType: "Conference" | "Workshop" | "Seminar";
  startDate: string;
  endDate: string;
  location: string;
  isVirtual: boolean;
  maxAttendees: number;
  registrationDeadline: string;
  status: string;
  sessions: {
    id: string;
    eventId: string;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    location: string;
    maxAttendees: number;
  }[];
}

const defaultEvents: AcademicEvent[] = [
  {
    id: "1",
    title: "AI in Academia Conference 2024",
    description: "Annual gathering of AI researchers and academics.",
    eventType: "Conference",
    startDate: "2024-11-15",
    endDate: "2024-11-17",
    location: "Stanford University, CA",
    isVirtual: false,
    maxAttendees: 500,
    registrationDeadline: "2024-11-01",
    status: "Upcoming",
    sessions: [
      {
        id: "101",
        eventId: "1",
        title: "Keynote: Future of AI in Education",
        description: "Opening keynote discussing the impact of AI on education.",
        startTime: "2024-11-15T09:00:00",
        endTime: "2024-11-15T10:30:00",
        location: "Main Auditorium",
        maxAttendees: 500,
      },
      {
        id: "102",
        eventId: "1",
        title: "Workshop: Implementing AI in Curriculum",
        description: "Hands-on workshop on integrating AI into academic curricula.",
        startTime: "2024-11-15T11:00:00",
        endTime: "2024-11-15T13:00:00",
        location: "Workshop Room A",
        maxAttendees: 50,
      },
    ],
  },
  {
    id: "2",
    title: "Data Science in Research Symposium",
    description: "Exploring the role of data science in academic research.",
    eventType: "Conference",
    startDate: "2024-12-05",
    endDate: "2024-12-07",
    location: "MIT, Cambridge, MA",
    isVirtual: false,
    maxAttendees: 300,
    registrationDeadline: "2024-11-20",
    status: "Upcoming",
    sessions: [
      {
        id: "201",
        eventId: "2",
        title: "Data Visualization Techniques",
        description: "Advanced techniques for visualizing complex research data.",
        startTime: "2024-12-05T10:00:00",
        endTime: "2024-12-05T12:00:00",
        location: "Lecture Hall 1",
        maxAttendees: 100,
      },
    ],
  },
];

const eventTypes = ["Conference", "Workshop", "Seminar"] as const;
type EventType = (typeof eventTypes)[number];

export default function AcademicEventsPage() {
  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<AcademicEvent | null>(null);
  const [registeredSessions, setRegisteredSessions] = useState<string[]>([]);
  const { toast } = useToast();
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<EventType | "All">("All");

  useEffect(() => {
    // Load events from localStorage
    let storedEvents = JSON.parse(localStorage.getItem("academicEvents") || "[]");

    // Check if default events are already in stored events
    const defaultEventIds = defaultEvents.map((event) => event.id);
    const existingDefaultEvents = storedEvents.filter((event: AcademicEvent) =>
      defaultEventIds.includes(event.id),
    );

    // If some default events are missing, add them
    if (existingDefaultEvents.length < defaultEvents.length) {
      const missingDefaultEvents = defaultEvents.filter(
        (event: AcademicEvent) =>
          !storedEvents.some((storedEvent: AcademicEvent) => storedEvent.id === event.id),
      );
      storedEvents = [...storedEvents, ...missingDefaultEvents];
      localStorage.setItem("academicEvents", JSON.stringify(storedEvents));
    }

    setEvents(storedEvents);

    // Load user's registered sessions
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (currentUser) {
      const reservations = JSON.parse(localStorage.getItem("academicEventReservations") || "[]");
      const userReservations = reservations.filter((r: any) => r.userId === currentUser.id);
      setRegisteredSessions(userReservations.map((r: any) => r.sessionId));
    }
  }, []);

  const handleEventClick = (event: AcademicEvent) => {
    setSelectedEvent(event);
  };

  const handleBackClick = () => {
    setSelectedEvent(null);
  };

  const handleRegister = (sessionId: string) => {
    const session = selectedEvent?.sessions.find((s) => s.id === sessionId);
    if (session && selectedEvent) {
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
      if (!currentUser) {
        toast({
          title: "Error",
          description: "You must be logged in to register for events.",
          variant: "destructive",
        });
        return;
      }

      if (registeredSessions.includes(sessionId)) {
        toast({
          title: "Already Registered",
          description: "You have already registered for this session.",
          variant: "default",
        });
        return;
      }

      const reservation = {
        id: uuidv4(),
        userId: currentUser.id,
        eventId: selectedEvent.id,
        eventTitle: selectedEvent.title,
        eventDescription: selectedEvent.description,
        eventType: selectedEvent.eventType,
        eventStartDate: selectedEvent.startDate,
        eventEndDate: selectedEvent.endDate,
        eventLocation: selectedEvent.location,
        sessionId: session.id,
        sessionTitle: session.title,
        sessionDescription: session.description,
        sessionStartTime: session.startTime,
        sessionEndTime: session.endTime,
        sessionLocation: session.location,
      };

      const reservations = JSON.parse(localStorage.getItem("academicEventReservations") || "[]");
      reservations.push(reservation);
      localStorage.setItem("academicEventReservations", JSON.stringify(reservations));

      setRegisteredSessions((prev) => [...prev, sessionId]);
      toast({
        title: "Registration Successful",
        description: `You have been registered for the session: ${session.title}`,
      });

      router.push("/reservations");
    }
  };

  const handleAddEvent = () => {
    router.push("/add-academic-event");
  };

  const filteredEvents =
    selectedType === "All" ? events : events.filter((event) => event.eventType === selectedType);

  if (selectedEvent) {
    return (
      <div className="w-full">
        <div className="bg-gray-100 p-4 mb-6">
          <div className="max-w-7xl mx-auto">
            <Button variant="ghost" className="hover:bg-gray-200" onClick={handleBackClick}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4">
          <Card className="mb-8 shadow-lg">
            <CardHeader className="bg-gray-900 text-white">
              <CardTitle className="text-2xl md:text-3xl">{selectedEvent.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-600 mb-6">{selectedEvent.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-gray-700" />
                  <p className="text-sm">
                    {selectedEvent.startDate} to {selectedEvent.endDate}
                  </p>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-gray-700" />
                  <p className="text-sm">{selectedEvent.location}</p>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-gray-700" />
                  <p className="text-sm">Max Attendees: {selectedEvent.maxAttendees}</p>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-gray-700" />
                  <p className="text-sm">Deadline: {selectedEvent.registrationDeadline}</p>
                </div>
              </div>
              <Badge className="mt-4">{selectedEvent.eventType}</Badge>
            </CardContent>
          </Card>
          <h3 className="text-2xl font-bold mb-6">Sessions</h3>
          <ScrollArea className="h-[60vh]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {selectedEvent.sessions.map((session) => (
                <Card key={session.id} className="shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="bg-gray-300">
                    <CardTitle className="text-lg">{session.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-gray-600 mb-4">{session.description}</p>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-500" />
                        <p className="text-sm">
                          {new Date(session.startTime).toLocaleString()} -{" "}
                          {new Date(session.endTime).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                        <p className="text-sm">{session.location}</p>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-gray-500" />
                        <p className="text-sm">Max Attendees: {session.maxAttendees}</p>
                      </div>
                    </div>
                    <Button
                      className="mt-4 w-full bg-gray-900 hover:bg-gray-800 text-white"
                      onClick={() => handleRegister(session.id)}
                      disabled={registeredSessions.includes(session.id)}
                    >
                      {registeredSessions.includes(session.id)
                        ? "Already Registered"
                        : "Register for Session"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-gray-100 p-4 mb-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h2 className="text-3xl font-bold">Upcoming Academic Events</h2>
          <div className="flex items-center space-x-4">
            <Select
              onValueChange={(value) => setSelectedType(value as EventType | "All")}
              defaultValue="All"
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Types</SelectItem>
                {eventTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAddEvent}>
              <Plus className="mr-2 h-4 w-4" /> Add Event
            </Button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card
              key={event.id}
              className="cursor-pointer hover:shadow-lg transition-shadow border border-gray-200"
              onClick={() => handleEventClick(event)}
            >
              <CardHeader className="bg-gray-300">
                <div className="flex justify-between items-start">
                  <CardTitle>{event.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <Badge variant="default" className="mb-1">
                  {event.eventType}
                </Badge>
                <p className="text-gray-600 mb-4">{event.description}</p>
                <div className="flex items-center mb-2">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <p className="text-sm">
                    {event.startDate} to {event.endDate}
                  </p>
                </div>
                <div className="flex items-center mb-2">
                  <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                  <p className="text-sm">{event.location}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}