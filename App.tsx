
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Pet, AppState, ChatMessage, EvolutionData } from './types';
import { generatePetLoreAndStats, generatePetImage, getPetResponse, evolvePet } from './services/gemini';
import { playSound, startAmbientIdle, stopAmbientIdle } from './services/sound';
import { 
  Dna, 
  MessageSquare, 
  FlaskConical, 
  Zap, 
  Shield, 
  Brain, 
  Wind, 
  PlusCircle, 
  ArrowLeft,
  ChevronRight,
  Info,
  Volume2,
  VolumeX
} from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>('GENESIS');
  const [pet, setPet] = useState<Pet | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [concept, setConcept] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // Handle ambient idle sound on dashboard
  useEffect(() => {
    if (state === 'DASHBOARD' && pet && !isMuted) {
      startAmbientIdle(isMuted);
    } else {
      stopAmbientIdle();
    }
    return () => stopAmbientIdle();
  }, [state, pet, isMuted]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      stopAmbientIdle();
    }
  };

  const handleGenesis = async () => {
    if (!concept) return;
    setIsLoading(true);
    setLoadingMsg('Synthesizing DNA signatures...');
    playSound('genesis', isMuted);
    try {
      const loreData = await generatePetLoreAndStats(concept);
      setLoadingMsg('Rendering biological structure...');
      const imageUrl = await generatePetImage(loreData.visualPrompt);
      
      const newPet: Pet = {
        id: Math.random().toString(36).substr(2, 9),
        name: loreData.name,
        species: loreData.species,
        description: loreData.description,
        lore: loreData.lore,
        imageUrl,
        stats: loreData.stats,
        dna: concept,
        level: 1,
        personality: loreData.personality
      };
      
      setPet(newPet);
      setState('DASHBOARD');
      setChatHistory([{
        role: 'pet',
        text: `*A light hums as the incubation chamber opens* ... Greetings, creator. I am ${newPet.name}.`,
        timestamp: Date.now()
      }]);
    } catch (error) {
      console.error(error);
      alert('Genesis failed. The bio-signature was unstable. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChat = async () => {
    if (!inputValue.trim() || !pet) return;
    
    playSound('message', isMuted);
    const userMsg: ChatMessage = { role: 'user', text: inputValue, timestamp: Date.now() };
    setChatHistory(prev => [...prev, userMsg]);
    setInputValue('');
    
    try {
      const petResponse = await getPetResponse(pet, inputValue, chatHistory);
      const petMsg: ChatMessage = { role: 'pet', text: petResponse, timestamp: Date.now() };
      setChatHistory(prev => [...prev, petMsg]);
    } catch (error) {
      console.error(error);
    }
  };

  const startEvolution = async (coreType: string) => {
    if (!pet) return;
    setIsLoading(true);
    setLoadingMsg(`Injecting ${coreType} Core...`);
    playSound('evolve', isMuted);
    try {
      const evolutionData = await evolvePet(pet, coreType);
      setLoadingMsg('Restructuring molecular bonds...');
      const newImageUrl = await generatePetImage(evolutionData.newVisualPrompt);
      
      setPet(prev => prev ? {
        ...prev,
        name: evolutionData.newName,
        species: evolutionData.newSpecies,
        imageUrl: newImageUrl,
        level: prev.level + 1,
        stats: {
          strength: prev.stats.strength + evolutionData.statBoosts.strength,
          agility: prev.stats.agility + evolutionData.statBoosts.agility,
          intelligence: prev.stats.intelligence + evolutionData.statBoosts.intelligence,
          vitality: prev.stats.vitality + evolutionData.statBoosts.vitality,
        }
      } : null);
      
      setChatHistory(prev => [...prev, {
        role: 'pet',
        text: `*The air crackles with energy* ... I feel... more powerful. The ${coreType} core has changed me.`,
        timestamp: Date.now()
      }]);
      setState('DASHBOARD');
    } catch (error) {
      console.error(error);
      alert('Evolution interrupted. The subject survived, but no changes occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const navigate = (target: AppState) => {
    playSound('click', isMuted);
    setState(target);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4">
        <div className="w-64 h-64 relative mb-8">
          <div className="absolute inset-0 border-4 border-blue-500 rounded-full animate-ping opacity-20"></div>
          <div className="absolute inset-4 border-2 border-blue-400 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Dna className="w-16 h-16 text-blue-500 animate-pulse" />
          </div>
        </div>
        <h2 className="text-2xl font-orbitron text-blue-400 animate-pulse text-center">{loadingMsg}</h2>
        <p className="mt-4 text-gray-500 italic">"Patience is the foundation of life..."</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg shadow-lg neon-glow">
            <Zap className="text-white" size={24} />
          </div>
          <h1 className="text-3xl font-orbitron font-bold tracking-widest text-white">
            EVO-<span className="text-blue-500">Z</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleMute}
            className="p-2 glass rounded-full text-gray-400 hover:text-white transition-colors"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          {pet && (
            <button 
              onClick={() => navigate(state === 'DASHBOARD' ? 'LAB' : 'DASHBOARD')}
              className="px-4 py-2 glass rounded-full flex items-center gap-2 hover:bg-white/10 transition-all border border-blue-500/30 text-blue-400 font-orbitron text-sm"
            >
              {state === 'DASHBOARD' ? <FlaskConical size={18} /> : <ArrowLeft size={18} />}
              {state === 'DASHBOARD' ? 'EVOLUTION LAB' : 'BACK TO NEXUS'}
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {state === 'GENESIS' && (
          <div className="lg:col-span-12 flex flex-col items-center justify-center py-20 text-center">
            <h2 className="text-5xl font-orbitron font-bold mb-6 neon-text text-white">GENESIS CHAMBER</h2>
            <p className="text-gray-400 max-w-lg mb-12 text-lg">
              In 2026, we don't catch pets. We dream them into existence. 
              What kind of being will you manifest today?
            </p>
            <div className="w-full max-w-2xl relative">
              <input 
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="Describe your pet's concept (e.g., A celestial phoenix made of stardust and ancient gears)"
                className="w-full bg-white/5 border-2 border-white/10 p-6 rounded-2xl text-xl focus:outline-none focus:border-blue-500 transition-all placeholder:text-gray-600"
              />
              <button 
                onClick={handleGenesis}
                disabled={!concept}
                className="absolute right-3 top-3 bottom-3 px-8 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white rounded-xl font-orbitron transition-all flex items-center gap-2"
              >
                INITIALIZE <ChevronRight size={20} />
              </button>
            </div>
            <div className="mt-8 flex gap-4 text-xs text-gray-500 font-orbitron">
              <span className="px-3 py-1 bg-white/5 rounded-full border border-white/10">GEMINI-3 PRO POWERED</span>
              <span className="px-3 py-1 bg-white/5 rounded-full border border-white/10">NEURAL RENDERING ACTIVE</span>
            </div>
          </div>
        )}

        {state === 'DASHBOARD' && pet && (
          <>
            {/* Visual Column */}
            <div className="lg:col-span-5 space-y-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative glass rounded-3xl overflow-hidden aspect-square border-2 border-white/5">
                  <img 
                    src={pet.imageUrl} 
                    alt={pet.name} 
                    className="w-full h-full object-cover animate-pet-idle"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex justify-between items-end">
                      <div>
                        <h3 className="text-2xl font-orbitron font-bold text-white">{pet.name}</h3>
                        <p className="text-blue-400 font-orbitron text-xs tracking-widest">{pet.species.toUpperCase()}</p>
                      </div>
                      <div className="bg-blue-600 text-white px-3 py-1 rounded-full font-orbitron text-sm">
                        LV. {pet.level}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6 space-y-4">
                <h4 className="font-orbitron text-xs text-gray-500 tracking-tighter uppercase">Biological Signature</h4>
                <div className="grid grid-cols-2 gap-4">
                  <StatBar icon={<Zap size={14}/>} label="Strength" value={pet.stats.strength} max={100} color="bg-red-500" />
                  <StatBar icon={<Wind size={14}/>} label="Agility" value={pet.stats.agility} max={100} color="bg-green-500" />
                  <StatBar icon={<Brain size={14}/>} label="Intellect" value={pet.stats.intelligence} max={100} color="bg-blue-500" />
                  <StatBar icon={<Shield size={14}/>} label="Vitality" value={pet.stats.vitality} max={100} color="bg-yellow-500" />
                </div>
              </div>

              <div className="glass rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Info size={16} className="text-blue-400" />
                  <h4 className="font-orbitron text-xs text-blue-400 tracking-widest uppercase">Ancient Files</h4>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed italic">{pet.lore}</p>
              </div>
            </div>

            {/* Interaction Column */}
            <div className="lg:col-span-7 flex flex-col h-[700px]">
              <div className="flex-1 glass rounded-3xl overflow-hidden flex flex-col border border-white/10">
                <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="font-orbitron text-sm text-gray-300">NEURAL LINK ESTABLISHED</span>
                  </div>
                  <MessageSquare size={18} className="text-gray-500" />
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                        msg.role === 'user' 
                          ? 'bg-blue-600 text-white rounded-tr-none' 
                          : 'glass border-blue-500/20 text-gray-200 rounded-tl-none'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                <div className="p-4 bg-black/40 border-t border-white/5">
                  <form 
                    onSubmit={(e) => { e.preventDefault(); handleChat(); }}
                    className="relative"
                  >
                    <input 
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={`Talk to ${pet.name}...`}
                      className="w-full bg-white/5 border border-white/10 p-4 pr-12 rounded-xl focus:outline-none focus:border-blue-500 transition-all text-sm"
                    />
                    <button 
                      type="submit"
                      className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-all"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </>
        )}

        {state === 'LAB' && pet && (
          <div className="lg:col-span-12">
            <div className="mb-12 text-center">
              <h2 className="text-4xl font-orbitron font-bold text-white mb-2">MODIFICATION LAB</h2>
              <p className="text-gray-400">Inject elemental or technological cores to forcibly evolve your biological subject.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <EvolutionCard 
                title="Inferno Core" 
                desc="Increases raw power and biological heat signature." 
                icon={<Zap className="text-orange-500" />} 
                onClick={() => startEvolution('Inferno')}
                color="orange"
              />
              <EvolutionCard 
                title="Glacier Core" 
                desc="Develops thick cryo-armor and endurance." 
                icon={<Shield className="text-cyan-400" />} 
                onClick={() => startEvolution('Glacier')}
                color="cyan"
              />
              <EvolutionCard 
                title="Quantum Core" 
                desc="Heightens intelligence and reality-warping abilities." 
                icon={<Brain className="text-purple-500" />} 
                onClick={() => startEvolution('Quantum')}
                color="purple"
              />
            </div>

            <div className="mt-12 p-8 glass rounded-3xl border border-dashed border-white/20 flex flex-col items-center">
              <PlusCircle size={48} className="text-gray-600 mb-4" />
              <h3 className="text-xl font-orbitron text-gray-500">Custom Modification</h3>
              <p className="text-gray-600 text-center max-w-md mt-2 mb-6 text-sm">Input custom DNA traits or environments to simulate a specialized evolution path.</p>
              <div className="w-full max-w-xl flex gap-2">
                <input 
                  placeholder="e.g. Mechanical wings, Cybernetic optics, Sub-aquatic gills..."
                  className="flex-1 bg-white/5 border border-white/10 p-3 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                />
                <button 
                  onClick={() => playSound('click', isMuted)}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-orbitron text-xs"
                >
                  SIMULATE
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-12 py-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-orbitron text-gray-600">
        <p>© 2026 EVO-Z BIOTECHNOLOGIES. ALL RIGHTS RESERVED.</p>
        <div className="flex gap-8">
          <button className="hover:text-blue-500 transition-colors">ARCHIVE</button>
          <button className="hover:text-blue-500 transition-colors">GLOBAL RANKINGS</button>
          <button className="hover:text-blue-500 transition-colors">SYSTEM STATUS</button>
        </div>
      </footer>
    </div>
  );
};

// --- Helper Components ---

const StatBar: React.FC<{ label: string, value: number, max: number, color: string, icon: React.ReactNode }> = ({ label, value, max, color, icon }) => (
  <div className="space-y-1">
    <div className="flex justify-between items-center text-[10px] uppercase font-orbitron">
      <div className="flex items-center gap-1 text-gray-400">
        {icon}
        <span>{label}</span>
      </div>
      <span className="text-gray-300">{value}</span>
    </div>
    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
      <div 
        className={`h-full ${color} transition-all duration-1000`} 
        style={{ width: `${(value / max) * 100}%` }}
      />
    </div>
  </div>
);

const EvolutionCard: React.FC<{ title: string, desc: string, icon: React.ReactNode, onClick: () => void, color: string }> = ({ title, desc, icon, onClick, color }) => {
  const borderColors: Record<string, string> = {
    orange: 'hover:border-orange-500/50',
    cyan: 'hover:border-cyan-500/50',
    purple: 'hover:border-purple-500/50'
  };
  const glowColors: Record<string, string> = {
    orange: 'group-hover:bg-orange-500/5',
    cyan: 'group-hover:bg-cyan-500/5',
    purple: 'group-hover:bg-purple-500/5'
  };

  return (
    <button 
      onClick={onClick}
      className={`group glass p-8 rounded-3xl border border-white/5 transition-all text-left flex flex-col h-full ${borderColors[color]} ${glowColors[color]}`}
    >
      <div className="mb-6 p-4 bg-white/5 rounded-2xl w-fit group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-orbitron font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed flex-1">{desc}</p>
      <div className="mt-6 flex items-center gap-2 text-xs font-orbitron text-gray-400 group-hover:text-white transition-colors">
        INITIATE EVOLUTION <ChevronRight size={14} />
      </div>
    </button>
  );
};

export default App;
