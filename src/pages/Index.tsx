import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, 
  Calendar, 
  MessageCircle, 
  MapPin, 
  ArrowRight,
  Sparkles,
  Heart,
  Zap
} from 'lucide-react';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const features = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Create Groups",
      description: "Organize your friend circles and manage multiple groups effortlessly"
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Plan Events",
      description: "Schedule hangouts, parties, and activities with smart RSVP tracking"
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Group Chat",
      description: "Keep the conversation going with real-time messaging"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Share Locations",
      description: "Never lose track of where to meet with integrated location sharing"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl mb-8 shadow-glow">
            <Users className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Huddle Up
            <span className="inline-flex items-center ml-2">
              <Sparkles className="w-8 h-8 md:w-12 md:h-12 text-yellow-300 animate-pulse" />
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            Stop juggling multiple apps. Plan events, chat with friends, and coordinate meetups all in one beautiful place.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 shadow-elevated text-lg px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105"
              onClick={() => navigate('/auth')}
            >
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2 text-white/80">
              <Heart className="w-5 h-5 text-red-400" />
              <span>Loved by friend groups everywhere</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-md mx-auto text-white/90">
            <div className="text-center">
              <div className="text-2xl font-bold">1000+</div>
              <div className="text-sm">Groups Created</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">5000+</div>
              <div className="text-sm">Events Planned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">98%</div>
              <div className="text-sm">Happy Users</div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="bg-white/95 backdrop-blur-sm shadow-elevated border-0 hover:shadow-glow transition-all duration-300 hover:scale-105">
              <CardHeader className="text-center pb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-primary rounded-xl mb-4 mx-auto">
                  {React.cloneElement(feature.icon, { className: "w-6 h-6 text-white" })}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-elevated max-w-2xl mx-auto">
            <CardHeader>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Zap className="w-8 h-8 text-yellow-300" />
                <CardTitle className="text-2xl text-white">Ready to Huddle Up?</CardTitle>
              </div>
              <CardDescription className="text-white/80 text-lg">
                Join thousands of friend groups who've made planning events effortless
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                size="lg" 
                className="bg-gradient-primary hover:opacity-90 shadow-glow text-lg px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105"
                onClick={() => navigate('/auth')}
              >
                Start Planning Today
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <p className="text-white/60 text-sm mt-4">
                No credit card required • Free forever plan available
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
