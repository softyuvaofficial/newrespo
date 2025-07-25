'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminSidebar from '@/components/AdminSidebar';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Plus, Search, Filter, Eye, Trash2, Save } from 'lucide-react';

export default function AdminCreateTest() {
  const { admin, loading, signOut } = useAdminAuth();
  const router = useRouter();

  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [creating, setCreating] = useState(false);

  const [testDetails, setTestDetails] = useState({
    title: '',
    description: '',
    categoryId: null,
    difficulty: 'medium',
    duration: 180,
    instructions: '',
    tabId: null
  });

  const [formErrors, setFormErrors] = useState({});
  const [testTabs, setTestTabs] = useState([]);

  // Admin authentication check aur demo data load karna
  useEffect(() => {
    if (!loading && !admin) {
      router.push('/admin-login');
      return;
    }

    if (admin) {
      // Demo questions generate kar rahe hain
      const demoQuestions = [];
      for (let i = 1; i <= 100; i++) {
        demoQuestions.push({
          id: i,
          questionText: `Question ${i}: Is prashn ka sahi uttar kya hai? (${i <= 30 ? 'Physics' : i <= 60 ? 'Chemistry' : 'Mathematics'})`,
          optionA: `Option A for question ${i}`,
          optionB: `Option B for question ${i}`,
          optionC: `Option C for question ${i}`,
          optionD: `Option D for question ${i}`,
          correctAnswer: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
          category: { id: 1, name: 'Engineering' },
          subject: i <= 30 ? 'Physics' : i <= 60 ? 'Chemistry' : 'Mathematics',
          topic: `Topic ${Math.floor(i / 10) + 1}`,
          difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)],
          usageCount: Math.floor(Math.random() * 20)
        });
      }
      setQuestions(demoQuestions);

      setCategories([
        { id: 1, name: 'Engineering' },
        { id: 2, name: 'Medical' },
        { id: 3, name: 'Banking' },
        { id: 4, name: 'Civil Services' }
      ]);

      setSubjects(['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Reasoning']);

      setTestTabs([
        { id: 1, name: 'Mock Test', type: 'mock' },
        { id: 2, name: 'Previous Year', type: 'pyq' },
        { id: 3, name: 'Booster', type: 'booster' },
        { id: 4, name: 'Sectional', type: 'sectional' },
        { id: 5, name: 'Speed Test', type: 'speed' }
      ]);
    }
  }, [admin, loading, router]);

  // Logout function
  const handleSignOut = async () => {
    await signOut();
    router.push('/admin-login');
  };

  // Filter questions based on user inputs
  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.questionText.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || question.category.id.toString() === selectedCategory;
    const matchesSubject = selectedSubject === 'all' || question.subject === selectedSubject;
    const matchesDifficulty = selectedDifficulty === 'all' || question.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesSubject && matchesDifficulty;
  });

  const filteredQuestionIds = filteredQuestions.map(q => q.id);
  const areAllFilteredSelected = filteredQuestionIds.length > 0 && filteredQuestionIds.every(id => selectedQuestions.includes(id));

  // Ek question select ya deselect karna
  const handleQuestionSelect = (questionId) => {
    setSelectedQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  // Sabhi filtered questions ko select/deselect karna
  const handleSelectAll = () => {
    if (areAllFilteredSelected) {
      // Agar sabhi filtered questions pehle se selected hain, to unhe deselect karo
      setSelectedQuestions(prev => prev.filter(id => !filteredQuestionIds.includes(id)));
    } else {
      // Varna, sabhi filtered questions ko select karo (purane selection ko rakhte hue)
      setSelectedQuestions(prev => [...new Set([...prev, ...filteredQuestionIds])]);
    }
  };

  // Auto select karne ka helper function
  const handleAutoSelect = (count, difficulty = null, subject = null) => {
    let availableQuestions = filteredQuestions;

    if (difficulty) {
      availableQuestions = availableQuestions.filter(q => q.difficulty === difficulty);
    }

    if (subject) {
      availableQuestions = availableQuestions.filter(q => q.subject === subject);
    }

    const randomQuestions = availableQuestions
      .sort(() => 0.5 - Math.random())
      .slice(0, count)
      .map(q => q.id);

    setSelectedQuestions(prev => [...new Set([...prev, ...randomQuestions])]);
  };

  // Form validation function
  const validateForm = () => {
    const errors = {};
    if (!testDetails.title.trim()) errors.title = 'Test title jaruri hai';
    if (!testDetails.categoryId) errors.categoryId = 'Category select karna zaroori hai';
    if (!testDetails.tabId) errors.tabId = 'Test tab select karna zaroori hai';
    if (selectedQuestions.length === 0) errors.questions = 'Kam se kam ek question select karein';
    if (!testDetails.duration || isNaN(testDetails.duration) || testDetails.duration <= 0) errors.duration = 'Sahi duration dalein';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Test create karna
  const handleCreateTest = () => {
    if (!validateForm()) return;

    if (!window.confirm('Kya aap sach mein ye test create karna chahte hain?')) return;

    setCreating(true);

    const newTest = {
      id: Date.now(),
      title: testDetails.title,
      description: testDetails.description,
      category: categories.find(c => c.id === testDetails.categoryId),
      difficulty: testDetails.difficulty,
      duration: testDetails.duration,
      totalQuestions: selectedQuestions.length,
      instructions: testDetails.instructions,
      tab: testTabs.find(t => t.id === testDetails.tabId),
      questions: selectedQuestions.map(id => questions.find(q => q.id === id)),
      createdAt: new Date().toISOString()
    };

    console.log('Test created:', newTest);
    alert('Test successfully create ho gaya!');

    // Reset form
    setTestDetails({
      title: '',
      description: '',
      categoryId: null,
      difficulty: 'medium',
      duration: 180,
      instructions: '',
      tabId: null
    });
    setSelectedQuestions([]);
    setFormErrors({});
    setCreating(false);
  };

  // Selected question hatao
  const removeSelectedQuestion = (questionId) => {
    setSelectedQuestions(prev => prev.filter(id => id !== questionId));
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar onSignOut={handleSignOut} />

      <div className="flex-1 lg:ml-0">
        {/* Header */}
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Test Banayein</h1>
              <p className="text-gray-600">Question bank se questions chun kar test banayein</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-blue-100 text-blue-800">
                {selectedQuestions.length} questions select kiye gaye
              </Badge>
              <Button onClick={handleCreateTest} disabled={creating || selectedQuestions.length === 0}>
                <Save className="h-4 w-4 mr-2" />
                {creating ? 'Create kar rahe hain...' : 'Test Banayein'}
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Test Configuration Form */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>Test Configuration</CardTitle>
                  <CardDescription>Apne test ki jankari yahan bharain</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="testTitle">Test Title *</Label>
                    <Input
                      id="testTitle"
                      value={testDetails.title}
                      onChange={(e) => setTestDetails({ ...testDetails, title: e.target.value })}
                      placeholder="Test ka naam daalein"
                    />
                    {formErrors.title && <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>}
                  </div>

                  <div>
                    <Label htmlFor="testDescription">Description</Label>
                    <Textarea
                      id="testDescription"
                      value={testDetails.description}
                      onChange={(e) => setTestDetails({ ...testDetails, description: e.target.value })}
                      placeholder="Test ka vivaran likhein"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="testCategory">Category *</Label>
                      <Select
                        value={testDetails.categoryId?.toString() || ''}
                        onValueChange={(value) =>
                          setTestDetails({ ...testDetails, categoryId: value ? Number(value) : null })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Category chuniye" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Select Category</SelectItem>
                          {categories.map(category => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formErrors.categoryId && <p className="text-red-500 text-sm mt-1">{formErrors.categoryId}</p>}
                    </div>

                    <div>
                      <Label htmlFor="testTab">Test Tab *</Label>
                      <Select
                        value={testDetails.tabId?.toString() || ''}
                        onValueChange={(value) =>
                          setTestDetails({ ...testDetails, tabId: value ? Number(value) : null })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Tab chuniye" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Select Tab</SelectItem>
                          {testTabs.map(tab => (
                            <SelectItem key={tab.id} value={tab.id.toString()}>
                              {tab.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formErrors.tabId && <p className="text-red-500 text-sm mt-1">{formErrors.tabId}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="testDifficulty">Difficulty</Label>
                      <Select
                        value={testDetails.difficulty}
                        onValueChange={(value) => setTestDetails({ ...testDetails, difficulty: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Aasaan</SelectItem>
                          <SelectItem value="medium">Madhyam</SelectItem>
                          <SelectItem value="hard">Kathin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="testDuration">Duration (min)</Label>
                      <Input
                        id="testDuration"
                        type="number"
                        min={1}
                        value={testDetails.duration}
                        onChange={(e) => setTestDetails({ ...testDetails, duration: Number(e.target.value) })}
                      />
                      {formErrors.duration && <p className="text-red-500 text-sm mt-1">{formErrors.duration}</p>}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="testInstructions">Instructions</Label>
                    <Textarea
                      id="testInstructions"
                      value={testDetails.instructions}
                      onChange={(e) => setTestDetails({ ...testDetails, instructions: e.target.value })}
                      placeholder="Test ke niyam aur instructions"
                      rows={3}
                    />
                  </div>

                  {/* Quick Auto Selection Buttons */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">Tezi se chunav karein</h4>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAutoSelect(30, null, 'Physics')}
                        className="w-full"
                      >
                        30 Physics ke prashn jodein
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAutoSelect(30, null, 'Chemistry')}
                        className="w-full"
                      >
                        30 Chemistry ke prashn jodein
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAutoSelect(30, null, 'Mathematics')}
                        className="w-full"
                      >
                        30 Maths ke prashn jodein
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAutoSelect(20, 'easy')}
                        className="w-full"
                      >
                        20 Aasaan prashn jodein
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Question Selection Tabs */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="select" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="select">Questions Chunav</TabsTrigger>
                  <TabsTrigger value="selected">Chune gaye Prashn ({selectedQuestions.length})</TabsTrigger>
                </TabsList>

                {/* All Questions */}
                <TabsContent value="select">
                  <Card>
                    <CardHeader>
                      <CardTitle>Question Bank</CardTitle>
                      <CardDescription>Question bank me se chunav karein</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Filters */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Prashn khojein..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>

                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sabhi Categories" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Sabhi Categories</SelectItem>
                            {categories.map(category => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sabhi Subjects" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Sabhi Subjects</SelectItem>
                            {subjects.map(subject => (
                              <SelectItem key={subject} value={subject}>
                                {subject}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sabhi Difficulties" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Sabhi Difficulty Levels</SelectItem>
                            <SelectItem value="easy">Aasaan</SelectItem>
                            <SelectItem value="medium">Madhyam</SelectItem>
                            <SelectItem value="hard">Kathin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Select All Checkbox */}
                      <div className="mb-4 flex items-center space-x-2">
                        <Checkbox
                          id="selectAll"
                          checked={areAllFilteredSelected}
                          onCheckedChange={handleSelectAll}
                          disabled={filteredQuestions.length === 0}
                        />
                        <Label htmlFor="selectAll" className="select-none">
                          Sabhi dikhaye gaye questions select karein
                        </Label>
                      </div>

                      {/* Question List */}
                      <div className="max-h-[50vh] overflow-y-auto border rounded-md p-2">
                        {filteredQuestions.length === 0 && <p className="text-gray-600">Koi prashn nahi mila</p>}
                        {filteredQuestions.map(question => (
                          <div
                            key={question.id}
                            className="border-b py-2 flex items-center space-x-3 hover:bg-gray-100 rounded cursor-pointer"
                            onClick={() => handleQuestionSelect(question.id)}
                          >
                            <Checkbox
                              checked={selectedQuestions.includes(question.id)}
                              onCheckedChange={() => handleQuestionSelect(question.id)}
                              onClick={e => e.stopPropagation()}
                            />
                            <div className="flex-1">
                              <p className="text-sm font-semibold">{question.questionText}</p>
                              <p className="text-xs text-gray-500">
                                Subject: {question.subject} | Difficulty: {question.difficulty} | Use Count:{' '}
                                {question.usageCount}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Selected Questions */}
                <TabsContent value="selected">
                  <Card>
                    <CardHeader>
                      <CardTitle>Chune Gaye Prashn</CardTitle>
                      <CardDescription>
                        Aapne {selectedQuestions.length} prashn select kiye hain
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {selectedQuestions.length === 0 && (
                        <p className="text-gray-600">Abhi tak koi prashn select nahi kiya gaya hai.</p>
                      )}
                      {selectedQuestions.map(id => {
                        const question = questions.find(q => q.id === id);
                        if (!question) return null;
                        return (
                          <div
                            key={id}
                            className="border-b py-2 flex justify-between items-center space-x-3 hover:bg-gray-100 rounded"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-semibold">{question.questionText}</p>
                              <p className="text-xs text-gray-500">
                                Subject: {question.subject} | Difficulty: {question.difficulty}
                              </p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => removeSelectedQuestion(id)}>
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
