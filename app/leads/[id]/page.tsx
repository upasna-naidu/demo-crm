'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

const COUNTRY_CODES = [
  { code: '+1', name: 'USA/Canada', digits: 10 },
  { code: '+7', name: 'Russia', digits: 10 },
  { code: '+20', name: 'Egypt', digits: 10 },
  { code: '+27', name: 'South Africa', digits: 9 },
  { code: '+30', name: 'Greece', digits: 10 },
  { code: '+31', name: 'Netherlands', digits: 9 },
  { code: '+32', name: 'Belgium', digits: 9 },
  { code: '+33', name: 'France', digits: 9 },
  { code: '+34', name: 'Spain', digits: 9 },
  { code: '+36', name: 'Hungary', digits: 9 },
  { code: '+39', name: 'Italy', digits: 10 },
  { code: '+40', name: 'Romania', digits: 9 },
  { code: '+41', name: 'Switzerland', digits: 9 },
  { code: '+43', name: 'Austria', digits: 10 },
  { code: '+44', name: 'UK', digits: 10 },
  { code: '+45', name: 'Denmark', digits: 8 },
  { code: '+46', name: 'Sweden', digits: 9 },
  { code: '+47', name: 'Norway', digits: 8 },
  { code: '+48', name: 'Poland', digits: 9 },
  { code: '+49', name: 'Germany', digits: 11 },
  { code: '+51', name: 'Peru', digits: 9 },
  { code: '+52', name: 'Mexico', digits: 10 },
  { code: '+53', name: 'Cuba', digits: 8 },
  { code: '+54', name: 'Argentina', digits: 10 },
  { code: '+55', name: 'Brazil', digits: 11 },
  { code: '+56', name: 'Chile', digits: 9 },
  { code: '+57', name: 'Colombia', digits: 10 },
  { code: '+58', name: 'Venezuela', digits: 10 },
  { code: '+60', name: 'Malaysia', digits: 9 },
  { code: '+61', name: 'Australia', digits: 9 },
  { code: '+62', name: 'Indonesia', digits: 10 },
  { code: '+63', name: 'Philippines', digits: 10 },
  { code: '+64', name: 'New Zealand', digits: 9 },
  { code: '+65', name: 'Singapore', digits: 8 },
  { code: '+66', name: 'Thailand', digits: 9 },
  { code: '+81', name: 'Japan', digits: 10 },
  { code: '+82', name: 'South Korea', digits: 10 },
  { code: '+84', name: 'Vietnam', digits: 9 },
  { code: '+86', name: 'China', digits: 11 },
  { code: '+90', name: 'Turkey', digits: 10 },
  { code: '+91', name: 'India', digits: 10 },
  { code: '+92', name: 'Pakistan', digits: 10 },
  { code: '+93', name: 'Afghanistan', digits: 9 },
  { code: '+94', name: 'Sri Lanka', digits: 9 },
  { code: '+95', name: 'Myanmar', digits: 9 },
  { code: '+98', name: 'Iran', digits: 10 },
  { code: '+212', name: 'Morocco', digits: 9 },
  { code: '+213', name: 'Algeria', digits: 9 },
  { code: '+216', name: 'Tunisia', digits: 8 },
  { code: '+218', name: 'Libya', digits: 9 },
  { code: '+220', name: 'Gambia', digits: 7 },
  { code: '+221', name: 'Senegal', digits: 9 },
  { code: '+222', name: 'Mauritania', digits: 8 },
  { code: '+223', name: 'Mali', digits: 8 },
  { code: '+224', name: 'Guinea', digits: 9 },
  { code: '+225', name: 'Ivory Coast', digits: 8 },
  { code: '+226', name: 'Burkina Faso', digits: 8 },
  { code: '+227', name: 'Niger', digits: 8 },
  { code: '+228', name: 'Togo', digits: 8 },
  { code: '+229', name: 'Benin', digits: 8 },
  { code: '+230', name: 'Mauritius', digits: 8 },
  { code: '+231', name: 'Liberia', digits: 8 },
  { code: '+232', name: 'Sierra Leone', digits: 8 },
  { code: '+233', name: 'Ghana', digits: 9 },
  { code: '+234', name: 'Nigeria', digits: 10 },
  { code: '+235', name: 'Chad', digits: 8 },
  { code: '+236', name: 'Central African Republic', digits: 8 },
  { code: '+237', name: 'Cameroon', digits: 9 },
  { code: '+238', name: 'Cape Verde', digits: 7 },
  { code: '+239', name: 'São Tomé and Príncipe', digits: 7 },
  { code: '+240', name: 'Equatorial Guinea', digits: 9 },
  { code: '+241', name: 'Gabon', digits: 8 },
  { code: '+242', name: 'Republic of the Congo', digits: 9 },
  { code: '+243', name: 'Democratic Republic of the Congo', digits: 9 },
  { code: '+244', name: 'Angola', digits: 9 },
  { code: '+245', name: 'Guinea-Bissau', digits: 7 },
  { code: '+246', name: 'Diego Garcia', digits: 7 },
  { code: '+248', name: 'Seychelles', digits: 7 },
  { code: '+249', name: 'Sudan', digits: 9 },
  { code: '+250', name: 'Rwanda', digits: 9 },
  { code: '+251', name: 'Ethiopia', digits: 9 },
  { code: '+252', name: 'Somalia', digits: 8 },
  { code: '+253', name: 'Djibouti', digits: 8 },
  { code: '+254', name: 'Kenya', digits: 9 },
  { code: '+255', name: 'Tanzania', digits: 9 },
  { code: '+256', name: 'Uganda', digits: 9 },
  { code: '+257', name: 'Burundi', digits: 8 },
  { code: '+258', name: 'Mozambique', digits: 8 },
  { code: '+260', name: 'Zambia', digits: 9 },
  { code: '+261', name: 'Madagascar', digits: 9 },
  { code: '+262', name: 'Réunion', digits: 9 },
  { code: '+263', name: 'Zimbabwe', digits: 9 },
  { code: '+264', name: 'Namibia', digits: 9 },
  { code: '+265', name: 'Malawi', digits: 9 },
  { code: '+266', name: 'Lesotho', digits: 8 },
  { code: '+267', name: 'Botswana', digits: 8 },
  { code: '+268', name: 'Eswatini', digits: 8 },
  { code: '+269', name: 'Comoros', digits: 7 },
  { code: '+290', name: 'Saint Helena', digits: 5 },
  { code: '+291', name: 'Eritrea', digits: 8 },
  { code: '+297', name: 'Aruba', digits: 7 },
  { code: '+298', name: 'Faroe Islands', digits: 6 },
  { code: '+299', name: 'Greenland', digits: 6 },
  { code: '+350', name: 'Gibraltar', digits: 8 },
  { code: '+351', name: 'Portugal', digits: 9 },
  { code: '+352', name: 'Luxembourg', digits: 9 },
  { code: '+353', name: 'Ireland', digits: 9 },
  { code: '+354', name: 'Iceland', digits: 7 },
  { code: '+355', name: 'Albania', digits: 9 },
  { code: '+356', name: 'Malta', digits: 8 },
  { code: '+357', name: 'Cyprus', digits: 8 },
  { code: '+358', name: 'Finland', digits: 9 },
  { code: '+359', name: 'Bulgaria', digits: 9 },
  { code: '+370', name: 'Lithuania', digits: 8 },
  { code: '+371', name: 'Latvia', digits: 8 },
  { code: '+372', name: 'Estonia', digits: 8 },
  { code: '+373', name: 'Moldova', digits: 8 },
  { code: '+374', name: 'Armenia', digits: 8 },
  { code: '+375', name: 'Belarus', digits: 9 },
  { code: '+376', name: 'Andorra', digits: 6 },
  { code: '+377', name: 'Monaco', digits: 8 },
  { code: '+378', name: 'San Marino', digits: 10 },
  { code: '+380', name: 'Ukraine', digits: 9 },
  { code: '+381', name: 'Serbia', digits: 9 },
  { code: '+382', name: 'Montenegro', digits: 8 },
  { code: '+383', name: 'Kosovo', digits: 8 },
  { code: '+385', name: 'Croatia', digits: 9 },
  { code: '+386', name: 'Slovenia', digits: 9 },
  { code: '+387', name: 'Bosnia and Herzegovina', digits: 8 },
  { code: '+389', name: 'North Macedonia', digits: 8 },
  { code: '+420', name: 'Czech Republic', digits: 9 },
  { code: '+421', name: 'Slovakia', digits: 9 },
  { code: '+423', name: 'Liechtenstein', digits: 7 },
  { code: '+500', name: 'Falkland Islands', digits: 5 },
  { code: '+501', name: 'Belize', digits: 7 },
  { code: '+502', name: 'Guatemala', digits: 8 },
  { code: '+503', name: 'El Salvador', digits: 8 },
  { code: '+504', name: 'Honduras', digits: 8 },
  { code: '+505', name: 'Nicaragua', digits: 8 },
  { code: '+506', name: 'Costa Rica', digits: 8 },
  { code: '+507', name: 'Panama', digits: 8 },
  { code: '+508', name: 'Saint Pierre and Miquelon', digits: 6 },
  { code: '+509', name: 'Haiti', digits: 8 },
  { code: '+590', name: 'Guadeloupe', digits: 9 },
  { code: '+591', name: 'Bolivia', digits: 8 },
  { code: '+592', name: 'Guyana', digits: 7 },
  { code: '+593', name: 'Ecuador', digits: 9 },
  { code: '+594', name: 'French Guiana', digits: 9 },
  { code: '+595', name: 'Paraguay', digits: 9 },
  { code: '+596', name: 'Martinique', digits: 9 },
  { code: '+597', name: 'Suriname', digits: 7 },
  { code: '+598', name: 'Uruguay', digits: 8 },
  { code: '+599', name: 'Netherlands Antilles', digits: 7 },
  { code: '+670', name: 'East Timor', digits: 8 },
  { code: '+672', name: 'Norfolk Island', digits: 6 },
  { code: '+673', name: 'Brunei', digits: 7 },
  { code: '+674', name: 'Nauru', digits: 7 },
  { code: '+675', name: 'Papua New Guinea', digits: 8 },
  { code: '+676', name: 'Tonga', digits: 5 },
  { code: '+677', name: 'Solomon Islands', digits: 7 },
  { code: '+678', name: 'Vanuatu', digits: 7 },
  { code: '+679', name: 'Fiji', digits: 7 },
  { code: '+680', name: 'Palau', digits: 7 },
  { code: '+681', name: 'Wallis and Futuna', digits: 6 },
  { code: '+682', name: 'Cook Islands', digits: 5 },
  { code: '+683', name: 'Niue', digits: 4 },
  { code: '+684', name: 'American Samoa', digits: 7 },
  { code: '+685', name: 'Samoa', digits: 7 },
  { code: '+686', name: 'Kiribati', digits: 5 },
  { code: '+687', name: 'New Caledonia', digits: 6 },
  { code: '+688', name: 'Tuvalu', digits: 5 },
  { code: '+689', name: 'French Polynesia', digits: 8 },
  { code: '+690', name: 'Tokelau', digits: 4 },
  { code: '+691', name: 'Micronesia', digits: 7 },
  { code: '+692', name: 'Marshall Islands', digits: 7 },
  { code: '+850', name: 'North Korea', digits: 10 },
  { code: '+852', name: 'Hong Kong', digits: 8 },
  { code: '+853', name: 'Macau', digits: 8 },
  { code: '+855', name: 'Cambodia', digits: 9 },
  { code: '+856', name: 'Laos', digits: 9 },
  { code: '+880', name: 'Bangladesh', digits: 10 },
  { code: '+886', name: 'Taiwan', digits: 9 },
  { code: '+960', name: 'Maldives', digits: 7 },
  { code: '+961', name: 'Lebanon', digits: 8 },
  { code: '+962', name: 'Jordan', digits: 9 },
  { code: '+963', name: 'Syria', digits: 9 },
  { code: '+964', name: 'Iraq', digits: 10 },
  { code: '+965', name: 'Kuwait', digits: 8 },
  { code: '+966', name: 'Saudi Arabia', digits: 9 },
  { code: '+967', name: 'Yemen', digits: 9 },
  { code: '+968', name: 'Oman', digits: 8 },
  { code: '+970', name: 'Palestine', digits: 9 },
  { code: '+971', name: 'UAE', digits: 9 },
  { code: '+972', name: 'Israel', digits: 9 },
  { code: '+973', name: 'Bahrain', digits: 8 },
  { code: '+974', name: 'Qatar', digits: 8 },
  { code: '+975', name: 'Bhutan', digits: 8 },
  { code: '+976', name: 'Mongolia', digits: 8 },
  { code: '+977', name: 'Nepal', digits: 10 },
  { code: '+992', name: 'Tajikistan', digits: 9 },
  { code: '+993', name: 'Turkmenistan', digits: 8 },
  { code: '+994', name: 'Azerbaijan', digits: 9 },
  { code: '+995', name: 'Georgia', digits: 9 },
  { code: '+996', name: 'Kyrgyzstan', digits: 9 },
  { code: '+998', name: 'Uzbekistan', digits: 9 },
];

export default function LeadDetailPage() {
  const params = useParams();
  const leadId = params.id as string;
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeActivityTab, setActiveActivityTab] = useState('notes');
  const [stages, setStages] = useState<any[]>([]);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [editedContact, setEditedContact] = useState<any>({});
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [noteContent, setNoteContent] = useState('');
  const [notes, setNotes] = useState<any[]>([]);
  const [showCustomFields, setShowCustomFields] = useState(false);
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>({
    email: true,
    phone: true,
    company: true,
    utmSource: true,
    utmCampaign: true,
    source: true,
  });
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
  const [newPropertyName, setNewPropertyName] = useState('');
  const [newPropertyValue, setNewPropertyValue] = useState('');
  const [customProperties, setCustomProperties] = useState<Record<string, string>>({});
  const [propertyOrder, setPropertyOrder] = useState<string[]>([]);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailFrom, setEmailFrom] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emails, setEmails] = useState<any[]>([]);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [showTemplateList, setShowTemplateList] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const loadLead = async () => {
      try {
        const [leadRes, stagesRes] = await Promise.all([
          fetch(`/api/leads/${leadId}`),
          fetch('/api/stages'),
        ]);
        const leadData = await leadRes.json();
        const stagesData = await stagesRes.json();
        setLead(leadData);
        setStages(stagesData);
        setNotes(leadData.notes || []);

        // Load custom properties
        const customFields = leadData.customFields ? JSON.parse(leadData.customFields) : {};
        setCustomProperties(customFields);

        // Load property order from localStorage or use default
        const savedOrder = localStorage.getItem(`propertyOrder_${leadId}`);
        if (savedOrder) {
          setPropertyOrder(JSON.parse(savedOrder));
        } else {
          setPropertyOrder(Object.keys(customFields));
        }

        // Extract country code from phone if present
        const phone = leadData.phone || '';
        const matchedCountry = COUNTRY_CODES.find(c => phone.startsWith(c.code));
        if (matchedCountry) {
          setCountryCode(matchedCountry.code);
        }

        setEditedContact({
          email: leadData.email,
          phone: phone.replace(/^\+\d+/, ''), // Remove country code from display
          company: leadData.company,
        });
      } catch (error) {
        console.error('Failed to load:', error);
      } finally {
        setLoading(false);
      }
    };

    if (leadId) loadLead();
  }, [leadId]);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const res = await fetch('/api/email-templates');
        const data = await res.json();
        setTemplates(data || []);
      } catch (error) {
        console.error('Failed to load templates:', error);
      }
    };
    loadTemplates();
  }, []);

  const validateEmail = (email: string): boolean => {
    return email.includes('@');
  };

  const validatePhone = (phone: string, country: string): boolean => {
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length >= 7; // Allow any phone with at least 7 digits
  };

  const handleSaveContact = async () => {
    let isValid = true;

    // Validate email
    if (editedContact.email && !validateEmail(editedContact.email)) {
      setEmailError('Email must contain "@" symbol');
      isValid = false;
    } else {
      setEmailError('');
    }

    // Validate phone
    if (editedContact.phone && !validatePhone(editedContact.phone, countryCode)) {
      const countryInfo = COUNTRY_CODES.find(c => c.code === countryCode);
      setPhoneError(`${countryCode} requires exactly ${countryInfo?.digits} digits`);
      isValid = false;
    } else {
      setPhoneError('');
    }

    if (!isValid) return;

    // Combine country code with phone
    const fullPhone = editedContact.phone ? `${countryCode}${editedContact.phone.replace(/\D/g, '')}` : '';

    try {
      console.log('Saving contact for leadId:', leadId);
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: editedContact.email,
          phone: fullPhone,
          company: editedContact.company,
        }),
      });

      const data = await response.json();
      console.log('Save response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save contact');
      }

      // Update local state with saved data
      setLead({
        ...lead,
        email: editedContact.email,
        phone: fullPhone,
        company: editedContact.company,
      });

      // Update display to show the saved phone without country code
      setEditedContact({
        email: editedContact.email,
        phone: editedContact.phone, // Keep the entered number
        company: editedContact.company,
      });

      setIsEditingContact(false);
      alert('✅ Contact saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      alert('❌ Error saving contact: ' + String(error));
    }
  };

  const handleAddNote = async () => {
    if (!noteContent.trim()) return;
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId,
          content: noteContent,
          authorId: user?.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to save note');

      const newNote = await response.json();
      setNotes([
        {
          id: newNote.id,
          content: newNote.content,
          createdAt: newNote.createdAt,
          author: { name: user?.name || 'Admin' },
        },
        ...notes,
      ]);
      setNoteContent('');
    } catch (error) {
      alert('Error saving note: ' + String(error));
    }
  };

  const handleEditNote = (noteId: string, content: string) => {
    setEditingNoteId(noteId);
    setEditingNoteContent(content);
  };

  const handleSaveNote = (noteId: string) => {
    if (!editingNoteContent.trim()) return;
    const updatedNotes = notes.map(n =>
      n.id === noteId ? { ...n, content: editingNoteContent } : n
    );
    setNotes(updatedNotes);
    setEditingNoteId(null);
    setEditingNoteContent('');
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(notes.filter(n => n.id !== noteId));
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim() || !emailSubject.trim() || !emailBody.trim()) {
      alert('Template name, subject, and body are required');
      return;
    }

    try {
      const response = await fetch('/api/email-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: templateName,
          subject: emailSubject,
          body: emailBody,
        }),
      });

      if (!response.ok) throw new Error('Failed to save template');

      const newTemplate = await response.json();
      setTemplates([newTemplate, ...templates]);
      setShowTemplateModal(false);
      setTemplateName('');
      alert('Template saved!');
    } catch (error) {
      alert('Error saving template: ' + String(error));
    }
  };

  const handleApplyTemplate = (template: any) => {
    setEmailSubject(template.subject);
    setEmailBody(template.body);
    setShowTemplateList(false);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Delete this template?')) return;

    try {
      const response = await fetch(`/api/email-templates?id=${templateId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete template');

      setTemplates(templates.filter(t => t.id !== templateId));
      alert('Template deleted!');
    } catch (error) {
      alert('Error deleting template: ' + String(error));
    }
  };

  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailBody.trim()) {
      alert('Subject and body are required');
      return;
    }

    if (!emailFrom.trim()) {
      alert('FROM email is required');
      return;
    }

    setEmailSending(true);
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: lead.email,
          subject: emailSubject,
          body: emailBody,
          senderName: user?.name || 'CRM System',
          senderEmail: emailFrom,
        }),
      });

      if (!response.ok) throw new Error('Failed to send email');

      // Save email to database
      const emailRes = await fetch('/api/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId,
          subject: emailSubject,
          body: emailBody,
          from: emailFrom,
          to: lead.email,
          direction: 'sent',
        }),
      });

      if (emailRes.ok) {
        const savedEmail = await emailRes.json();
        const newEmail = {
          id: savedEmail.id,
          subject: emailSubject,
          body: emailBody,
          direction: 'sent',
          from: emailFrom,
          to: lead.email,
          createdAt: savedEmail.createdAt,
        };

        setEmails([newEmail, ...emails]);
        alert('Email sent successfully!');
        setShowEmailForm(false);
        setEmailSubject('');
        setEmailBody('');
        setEmailFrom('');
        setActiveActivityTab('emails');
      }

    } catch (error) {
      alert('Error sending email: ' + String(error));
    } finally {
      setEmailSending(false);
    }
  };

  const handleStageChange = (stageId: string) => {
    if (lead && stageId) {
      setLead({ ...lead, stageId, stage: stages.find(s => s.id === stageId) });
    }
  };

  const toggleFieldVisibility = (field: string) => {
    setVisibleFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleAddCustomProperty = () => {
    if (!newPropertyName.trim()) {
      alert('Property name is required');
      return;
    }

    const updatedProperties = {
      ...customProperties,
      [newPropertyName]: newPropertyValue,
    };

    setCustomProperties(updatedProperties);
    setLead({
      ...lead,
      customFields: JSON.stringify(updatedProperties),
    });

    setNewPropertyName('');
    setNewPropertyValue('');
    setShowAddPropertyModal(false);
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!lead || !lead.name) {
    return <div className="p-8 text-center">Lead not found</div>;
  }

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      {/* Header */}
      <div className="bg-white border-b p-6" style={{ borderBottomColor: 'var(--border-light)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold" style={{ backgroundColor: 'var(--accent)' }}>
              {(lead.name || '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{lead.name || 'Unnamed Lead'}</h1>
              <p style={{ color: 'var(--text-tertiary)' }}>{lead.leadId || lead.id}</p>
            </div>
          </div>
          <Link href="/contacts" className="btn btn-secondary">← Back</Link>
        </div>
      </div>

      {/* Main Content - Three Column */}
      <div className="flex-1 overflow-hidden flex gap-4 p-6">
        {/* Left Panel - Lead Details */}
        <div className="w-96 overflow-y-auto space-y-4">
          {/* Contact Actions */}
          <div className="card p-4">
            <div className="flex gap-2 justify-around">
              <button
                onClick={() => {
                  setActiveTab('activities');
                  setActiveActivityTab('emails');
                  setShowEmailForm(true);
                }}
                className="flex flex-col items-center gap-1 p-3 hover:bg-gray-50 rounded transition-colors flex-1"
                title="Send Email"
              >
                <span className="text-2xl">✉️</span>
                <span className="text-xs font-medium">Email</span>
              </button>
              <button className="flex flex-col items-center gap-1 p-3 hover:bg-gray-50 rounded transition-colors flex-1" title="Call Lead">
                <span className="text-2xl">☎️</span>
                <span className="text-xs font-medium">Call</span>
              </button>
              <button
                className="flex flex-col items-center gap-1 p-3 hover:bg-gray-50 rounded transition-colors flex-1"
                title="Add Note"
                onClick={() => { setActiveTab('activities'); setActiveActivityTab('notes'); }}
              >
                <span className="text-2xl">📝</span>
                <span className="text-xs font-medium">Note</span>
              </button>
              <button className="flex flex-col items-center gap-1 p-3 hover:bg-gray-50 rounded transition-colors flex-1" title="Meeting">
                <span className="text-2xl">📅</span>
                <span className="text-xs font-medium">Meeting</span>
              </button>
            </div>
          </div>

          {/* Contact Information - Editable */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm">Contact Information</h3>
              {!isEditingContact ? (
                <button
                  onClick={() => setIsEditingContact(true)}
                  className="text-xs font-medium px-2 py-1 border rounded hover:bg-gray-50"
                  style={{ borderColor: 'var(--border-light)', color: 'var(--primary)' }}
                >
                  Edit
                </button>
              ) : (
                <button
                  onClick={handleSaveContact}
                  className="text-xs font-medium px-2 py-1 border rounded"
                  style={{ backgroundColor: 'var(--primary)', color: 'white', borderColor: 'var(--primary)' }}
                >
                  Save
                </button>
              )}
            </div>
            <div className="space-y-4 text-sm">
              {/* Email */}
              {visibleFields.email && (
                <div>
                  <p className="text-xs font-bold uppercase" style={{ color: 'var(--text-tertiary)' }}>Email</p>
                  {isEditingContact ? (
                    <>
                      <input
                        type="email"
                        value={editedContact.email || ''}
                        onChange={(e) => setEditedContact({ ...editedContact, email: e.target.value })}
                        className="mt-1 w-full p-2 border rounded text-sm"
                        style={{ borderColor: emailError ? '#ef4444' : 'var(--border-light)' }}
                      />
                      {emailError && <p className="text-xs text-red-600 mt-1">{emailError}</p>}
                    </>
                  ) : (
                    <a href={`mailto:${lead.email}`} className="mt-1 block font-medium hover:underline" style={{ color: 'var(--primary)' }}>
                      {editedContact.email || '—'}
                    </a>
                  )}
                </div>
              )}

              {/* Phone */}
              {visibleFields.phone && (
                <div>
                  <p className="text-xs font-bold uppercase" style={{ color: 'var(--text-tertiary)' }}>Phone</p>
                  {isEditingContact ? (
                    <>
                      <div className="mt-1 flex gap-2">
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="flex-shrink-0 w-28 p-2 border rounded text-sm"
                          style={{ borderColor: 'var(--border-light)' }}
                        >
                          {COUNTRY_CODES.map(c => (
                            <option key={c.code} value={c.code}>
                              {c.code} {c.name}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={editedContact.phone || ''}
                          onChange={(e) => {
                            const numericValue = e.target.value.replace(/\D/g, '');
                            setEditedContact({ ...editedContact, phone: numericValue });
                          }}
                          placeholder="Numbers only"
                          className="flex-1 p-2 border rounded text-sm"
                          style={{ borderColor: phoneError ? '#ef4444' : 'var(--border-light)' }}
                          inputMode="numeric"
                        />
                      </div>
                      {phoneError && <p className="text-xs text-red-600 mt-1">{phoneError}</p>}
                    </>
                  ) : (
                    <p className="mt-1 font-medium">{editedContact.phone || lead.phone || '—'}</p>
                  )}
                </div>
              )}

              {/* Company */}
              {visibleFields.company && (
                <div>
                  <p className="text-xs font-bold uppercase" style={{ color: 'var(--text-tertiary)' }}>Company</p>
                  {isEditingContact ? (
                    <input
                      type="text"
                      value={editedContact.company || ''}
                      onChange={(e) => setEditedContact({ ...editedContact, company: e.target.value })}
                      className="mt-1 w-full p-2 border rounded text-sm"
                      style={{ borderColor: 'var(--border-light)' }}
                    />
                  ) : (
                    <p className="mt-1 font-medium">{editedContact.company || '—'}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Lead Source */}
          {(visibleFields.utmSource || visibleFields.utmCampaign || visibleFields.source) && (
            <div className="card p-4">
              <h3 className="font-bold text-sm mb-4">Lead Source</h3>
              <div className="space-y-4 text-sm">
                {visibleFields.utmSource && (
                  <div>
                    <p className="text-xs font-bold uppercase" style={{ color: 'var(--text-tertiary)' }}>UTM Source</p>
                    <p className="mt-1 font-medium">{lead.utmSource || '—'}</p>
                  </div>
                )}
                {visibleFields.utmCampaign && (
                  <div>
                    <p className="text-xs font-bold uppercase" style={{ color: 'var(--text-tertiary)' }}>UTM Campaign</p>
                    <p className="mt-1 font-medium">{lead.utmCampaign || '—'}</p>
                  </div>
                )}
                {visibleFields.source && (
                  <div>
                    <p className="text-xs font-bold uppercase" style={{ color: 'var(--text-tertiary)' }}>Source</p>
                    <p className="mt-1 font-medium">{lead.source || '—'}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lead Stage */}
          <div className="card p-4">
            <h3 className="font-bold text-sm mb-3">Lead Stage</h3>
            <select
              value={lead.stageId || ''}
              onChange={(e) => handleStageChange(e.target.value)}
              className="w-full font-bold text-sm p-2 border rounded"
              style={{
                color: 'var(--primary)',
                borderColor: 'var(--border-light)',
              }}
            >
              <option value="">Select Stage</option>
              {stages.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
              Current: <span className="font-bold" style={{ color: 'var(--primary)' }}>{lead.stage?.name || 'Unassigned'}</span>
            </p>
          </div>

          {/* Deal Value */}
          {lead.dealValue && (
            <div className="card p-4" style={{ background: `linear-gradient(135deg, rgba(107, 44, 57, 0.05) 0%, rgba(123, 67, 151, 0.05) 100%)`, border: `1px solid var(--border-light)` }}>
              <p className="text-xs font-bold uppercase" style={{ color: 'var(--text-tertiary)' }}>Deal Value</p>
              <p className="text-2xl font-bold mt-2" style={{ color: 'var(--primary)' }}>
                ${(lead.dealValue / 1000).toFixed(1)}k
              </p>
            </div>
          )}

          {/* Owner */}
          {lead.owner && lead.owner.name && (
            <div className="card p-4">
              <p className="text-xs font-bold uppercase" style={{ color: 'var(--text-tertiary)' }}>Owner</p>
              <div className="flex items-center gap-3 mt-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: 'var(--accent)' }}>
                  {lead.owner.name.charAt(0)}
                </div>
                <span className="font-medium text-sm">{lead.owner.name}</span>
              </div>
            </div>
          )}

          {/* Custom Properties & Field Visibility */}
          <div className="card p-4">
            <button
              onClick={() => setShowCustomFields(!showCustomFields)}
              className="w-full flex items-center justify-between font-bold text-sm"
            >
              <span>Custom Properties</span>
              <span>{showCustomFields ? '−' : '+'}</span>
            </button>
            {showCustomFields && (
              <div className="mt-4 pt-4 border-t space-y-3" style={{ borderTopColor: 'var(--border-light)' }}>
                {/* Field Visibility Toggle */}
                <div>
                  <p className="text-xs font-bold uppercase mb-2" style={{ color: 'var(--text-tertiary)' }}>Show/Hide Fields</p>
                  <div className="space-y-2">
                    {[
                      { key: 'email', label: 'Email' },
                      { key: 'phone', label: 'Phone' },
                      { key: 'company', label: 'Company' },
                      { key: 'utmSource', label: 'UTM Source' },
                      { key: 'utmCampaign', label: 'UTM Campaign' },
                      { key: 'source', label: 'Source' },
                    ].map(field => (
                      <label key={field.key} className="flex items-center gap-2 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={visibleFields[field.key]}
                          onChange={() => toggleFieldVisibility(field.key)}
                          className="w-4 h-4"
                        />
                        <span>{field.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Add Custom Property */}
                <div className="border-t pt-3" style={{ borderTopColor: 'var(--border-light)' }}>
                  <button
                    onClick={() => setShowAddPropertyModal(true)}
                    className="w-full text-xs font-medium py-2 px-3 border rounded hover:bg-gray-50 transition-colors"
                    style={{ borderColor: 'var(--border-light)', color: 'var(--primary)' }}
                  >
                    + Add Custom Property
                  </button>
                </div>

                {/* Existing Custom Fields */}
                {Object.keys(customProperties).length > 0 && (
                  <div className="border-t pt-3 space-y-2" style={{ borderTopColor: 'var(--border-light)' }}>
                    {propertyOrder.map((key, idx) => {
                      const value = customProperties[key];
                      if (!value) return null;
                      return (
                        <div key={key} className="text-xs p-2 bg-gray-50 rounded flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold uppercase" style={{ color: 'var(--text-tertiary)' }}>{key}</p>
                            <p className="mt-1 truncate">{String(value)}</p>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            {idx > 0 && (
                              <button
                                onClick={() => {
                                  const newOrder = [...propertyOrder];
                                  [newOrder[idx - 1], newOrder[idx]] = [newOrder[idx], newOrder[idx - 1]];
                                  setPropertyOrder(newOrder);
                                  localStorage.setItem(`propertyOrder_${leadId}`, JSON.stringify(newOrder));
                                }}
                                className="text-blue-600 hover:bg-blue-50 px-1.5 py-0.5 rounded transition-colors"
                                title="Move Up"
                              >
                                ↑
                              </button>
                            )}
                            {idx < propertyOrder.length - 1 && (
                              <button
                                onClick={() => {
                                  const newOrder = [...propertyOrder];
                                  [newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]];
                                  setPropertyOrder(newOrder);
                                  localStorage.setItem(`propertyOrder_${leadId}`, JSON.stringify(newOrder));
                                }}
                                className="text-blue-600 hover:bg-blue-50 px-1.5 py-0.5 rounded transition-colors"
                                title="Move Down"
                              >
                                ↓
                              </button>
                            )}
                            <button
                              onClick={() => {
                                const updated = { ...customProperties };
                                delete updated[key];
                                const newOrder = propertyOrder.filter(k => k !== key);
                                setCustomProperties(updated);
                                setPropertyOrder(newOrder);
                                localStorage.setItem(`propertyOrder_${leadId}`, JSON.stringify(newOrder));
                                setLead({
                                  ...lead,
                                  customFields: JSON.stringify(updated),
                                });
                              }}
                              className="text-red-600 hover:bg-red-50 px-1.5 py-0.5 rounded transition-colors"
                              title="Delete"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Created Date */}
          <div className="card p-4">
            <p className="text-xs font-bold uppercase" style={{ color: 'var(--text-tertiary)' }}>Created</p>
            <p className="mt-2 font-medium">{new Date(lead.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Center Panel - Tabs and Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="bg-white border-b mb-4 rounded-t-lg" style={{ borderBottomColor: 'var(--border-light)' }}>
            <div className="flex">
              {['overview', 'activities'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-all ${
                    activeTab === tab ? 'text-white' : 'text-gray-600 border-b-transparent'
                  }`}
                  style={
                    activeTab === tab
                      ? { backgroundColor: 'var(--primary)', borderBottomColor: 'var(--primary)', color: 'white' }
                      : { borderBottomColor: 'transparent' }
                  }
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="card flex-1 overflow-y-auto p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold mb-4 text-lg">Lead Information</h4>
                  <div className="grid grid-cols-2 gap-6 text-sm">
                    <div>
                      <p className="text-xs font-bold uppercase" style={{ color: 'var(--text-tertiary)' }}>Lead Status</p>
                      <p className="mt-2 font-medium">{lead.stage?.name || 'Not Set'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase" style={{ color: 'var(--text-tertiary)' }}>Created Date</p>
                      <p className="mt-2 font-medium">{new Date(lead.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase" style={{ color: 'var(--text-tertiary)' }}>UTM Source</p>
                      <p className="mt-2 font-medium">{lead.utmSource || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase" style={{ color: 'var(--text-tertiary)' }}>UTM Campaign</p>
                      <p className="mt-2 font-medium">{lead.utmCampaign || '—'}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6" style={{ borderTopColor: 'var(--border-light)' }}>
                  <h4 className="font-bold mb-4 text-lg">Activity Timeline</h4>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: 'var(--primary)' }}></div>
                      <div>
                        <p className="font-bold text-sm">Lead Created</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>{new Date(lead.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    {lead.emails && lead.emails.length > 0 && (
                      <div className="flex gap-4">
                        <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: 'var(--accent)' }}></div>
                        <div>
                          <p className="font-bold text-sm">Emails: {lead.emails.length}</p>
                          <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>Email communication</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'activities' && (
              <div className="space-y-6">
                {/* Activity Sub-tabs */}
                <div className="flex gap-2 border-b" style={{ borderBottomColor: 'var(--border-light)' }}>
                  {['notes', 'emails', 'calls', 'meetings'].map((subTab) => (
                    <button
                      key={subTab}
                      onClick={() => setActiveActivityTab(subTab)}
                      className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
                        activeActivityTab === subTab
                          ? 'border-b-2'
                          : 'border-b-2 border-transparent text-gray-600'
                      }`}
                      style={
                        activeActivityTab === subTab
                          ? { borderBottomColor: 'var(--primary)', color: 'var(--primary)' }
                          : {}
                      }
                    >
                      {subTab.charAt(0).toUpperCase() + subTab.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Notes Section */}
                {activeActivityTab === 'notes' && (
                  <div>
                    <h4 className="font-bold mb-4">Notes</h4>
                    <div className="space-y-3">
                      <textarea
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        placeholder="Add a note..."
                        className="w-full p-3 border rounded text-sm"
                        style={{ borderColor: 'var(--border-light)' }}
                        rows={3}
                      />
                      <button
                        onClick={handleAddNote}
                        className="btn btn-primary"
                      >
                        Add Note
                      </button>
                    </div>

                    {notes.length > 0 && (
                      <div className="mt-4 space-y-3">
                        {notes.map((note) => (
                          <div
                            key={note.id}
                            className="p-3 rounded border"
                            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-bold text-xs">{note.author?.name || 'Admin'}</p>
                                <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                                  {new Date(note.createdAt).toLocaleString()}
                                </p>
                              </div>
                              {editingNoteId !== note.id && (
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleEditNote(note.id, note.content)}
                                    className="text-xs px-2 py-1 rounded hover:bg-gray-300 transition-colors"
                                    title="Edit"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={() => handleDeleteNote(note.id)}
                                    className="text-xs px-2 py-1 rounded hover:bg-red-200 transition-colors"
                                    title="Delete"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              )}
                            </div>
                            {editingNoteId === note.id ? (
                              <div className="space-y-2">
                                <textarea
                                  value={editingNoteContent}
                                  onChange={(e) => setEditingNoteContent(e.target.value)}
                                  className="w-full p-2 border rounded text-sm"
                                  style={{ borderColor: 'var(--border-light)' }}
                                  rows={3}
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleSaveNote(note.id)}
                                    className="text-xs px-3 py-1 rounded font-medium text-white"
                                    style={{ backgroundColor: 'var(--primary)' }}
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingNoteId(null)}
                                    className="text-xs px-3 py-1 rounded border"
                                    style={{ borderColor: 'var(--border-light)' }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="mt-2 text-sm">{note.content}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Emails Section */}
                {activeActivityTab === 'emails' && (
                  <div className="space-y-4">
                    {!showEmailForm ? (
                      <button
                        onClick={() => setShowEmailForm(true)}
                        className="w-full btn btn-primary"
                      >
                        ✉️ Send Email
                      </button>
                    ) : (
                      <div className="border rounded-lg p-4" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-bold">Compose Email</h4>
                          <div className="flex gap-2">
                            {templates.length > 0 && (
                              <button
                                onClick={() => setShowTemplateList(!showTemplateList)}
                                className="text-xs px-2 py-1 border rounded hover:bg-gray-100"
                                style={{ borderColor: 'var(--border-light)' }}
                              >
                                📋 Templates ({templates.length})
                              </button>
                            )}
                            <button
                              onClick={() => setShowTemplateModal(true)}
                              className="text-xs px-2 py-1 border rounded hover:bg-gray-100"
                              style={{ borderColor: 'var(--border-light)' }}
                            >
                              💾 Save as Template
                            </button>
                          </div>
                        </div>

                        {showTemplateList && templates.length > 0 && (
                          <div className="mb-4 p-3 border rounded bg-white" style={{ borderColor: 'var(--border-light)' }}>
                            <p className="text-xs font-bold mb-2" style={{ color: 'var(--text-tertiary)' }}>Quick Templates</p>
                            <div className="space-y-2">
                              {templates.map((template) => (
                                <div key={template.id} className="flex items-center justify-between text-xs p-2 border rounded" style={{ borderColor: 'var(--border-light)' }}>
                                  <button
                                    onClick={() => handleApplyTemplate(template)}
                                    className="flex-1 text-left hover:font-bold"
                                  >
                                    {template.name}
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTemplate(template.id)}
                                    className="text-red-600 hover:text-red-800 px-2"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="space-y-3">
                          <div>
                            <label className="text-xs font-bold uppercase" style={{ color: 'var(--text-tertiary)' }}>
                              To
                            </label>
                            <p className="mt-1 p-2 bg-white rounded text-sm border" style={{ borderColor: 'var(--border-light)' }}>{lead.email}</p>
                          </div>

                          <div>
                            <label className="text-xs font-bold uppercase" style={{ color: 'var(--text-tertiary)' }}>
                              From
                            </label>
                            <input
                              type="email"
                              value={emailFrom}
                              onChange={(e) => setEmailFrom(e.target.value)}
                              placeholder="your-email@gmail.com"
                              className="w-full mt-1 p-2 border rounded text-sm"
                              style={{ borderColor: 'var(--border-light)' }}
                            />
                          </div>

                          <div>
                            <label className="text-xs font-bold uppercase" style={{ color: 'var(--text-tertiary)' }}>
                              Subject
                            </label>
                            <input
                              type="text"
                              value={emailSubject}
                              onChange={(e) => setEmailSubject(e.target.value)}
                              placeholder="Email subject"
                              className="w-full mt-1 p-2 border rounded text-sm"
                              style={{ borderColor: 'var(--border-light)' }}
                            />
                          </div>

                          <div>
                            <label className="text-xs font-bold uppercase" style={{ color: 'var(--text-tertiary)' }}>
                              Body
                            </label>
                            <textarea
                              value={emailBody}
                              onChange={(e) => setEmailBody(e.target.value)}
                              placeholder="Email body"
                              className="w-full mt-1 p-2 border rounded text-sm"
                              style={{ borderColor: 'var(--border-light)' }}
                              rows={4}
                            />
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setShowEmailForm(false);
                                setEmailSubject('');
                                setEmailBody('');
                                setEmailFrom('');
                              }}
                              disabled={emailSending}
                              className="flex-1 py-2 px-4 text-sm font-medium border rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                              style={{ borderColor: 'var(--border-light)' }}
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSendEmail}
                              disabled={emailSending}
                              className="flex-1 py-2 px-4 text-sm font-medium text-white rounded transition-colors disabled:opacity-50"
                              style={{ backgroundColor: 'var(--primary)' }}
                            >
                              {emailSending ? 'Sending...' : 'Send Email'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="font-bold mb-3">Email Log</h4>
                      {(emails.length > 0 || (lead.emails && lead.emails.length > 0)) ? (
                        <div className="space-y-3">
                          {emails.concat(lead.emails || []).map((email: any) => (
                            <div
                              key={email.id}
                              className="p-3 rounded border-l-4 text-sm"
                              style={{
                                backgroundColor: 'var(--bg-secondary)',
                                borderLeftColor: email.direction === 'sent' ? 'var(--primary)' : 'var(--accent)',
                              }}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="font-bold text-xs">
                                    {email.direction === 'sent' ? '📤 Sent' : '📥 Received'}
                                  </p>
                                  <p className="font-medium mt-1">{email.subject}</p>
                                  {email.body && (
                                    <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                                      {email.body}
                                    </p>
                                  )}
                                  <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
                                    {email.direction === 'sent' ? `From: ${email.from}` : `To: ${email.to}`}
                                  </p>
                                  <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                                    {new Date(email.createdAt).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ color: 'var(--text-tertiary)' }}>No emails yet</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Call Logs Section */}
                {activeActivityTab === 'calls' && (
                  <div>
                    <h4 className="font-bold mb-4">Call Logs</h4>
                    {lead.calls && lead.calls.length > 0 ? (
                      <div className="space-y-3">
                        {lead.calls.map((call: any) => (
                          <div
                            key={call.id}
                            className="p-3 rounded border-l-4"
                            style={{
                              backgroundColor: 'var(--bg-secondary)',
                              borderLeftColor: 'var(--primary)',
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="text-sm">
                                <p className="font-bold text-xs">☎️ Call Log</p>
                                {call.duration && (
                                  <p className="mt-1">Duration: {Math.round(call.duration / 60)} min</p>
                                )}
                                {call.notes && <p className="mt-1">{call.notes}</p>}
                              </div>
                            </div>
                            <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
                              {new Date(call.callTime).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: 'var(--text-tertiary)' }}>No call logs yet</p>
                    )}
                  </div>
                )}

                {/* Meetings Section */}
                {activeActivityTab === 'meetings' && (
                  <div>
                    <h4 className="font-bold mb-4">Meetings</h4>
                    <div className="space-y-3">
                      <button className="w-full btn btn-primary">Schedule Meeting</button>
                      <p style={{ color: 'var(--text-tertiary)' }}>No meetings scheduled yet</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Deals & Related */}
        <div className="w-72 overflow-y-auto space-y-4">
          {/* Associated Contacts */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm">Contacts (0)</h3>
              <button className="text-primary font-bold" style={{ color: 'var(--primary)' }}>+ Add</button>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>See the people associated with this record.</p>
          </div>

          {/* Associated Deals */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm">Deals (0)</h3>
              <button className="text-primary font-bold" style={{ color: 'var(--primary)' }}>+ Add</button>
            </div>
            <div className="mb-3">
              <input
                type="text"
                placeholder="Search deals..."
                className="w-full text-xs p-2 border rounded"
                style={{ borderColor: 'var(--border-light)' }}
              />
            </div>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>No deals yet</p>
          </div>

          {/* Tickets */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm">Tickets (0)</h3>
              <button className="text-primary font-bold" style={{ color: 'var(--primary)' }}>+ Add</button>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>No tickets yet</p>
          </div>

          {/* Attachments */}
          <div className="card p-4">
            <h3 className="font-bold text-sm mb-4">Attachments</h3>
            <p className="text-xs mb-3" style={{ color: 'var(--text-tertiary)' }}>See the files attached to your activities or uploaded to the record.</p>
            <button className="text-primary font-bold text-xs" style={{ color: 'var(--primary)' }}>Add</button>
          </div>
        </div>
      </div>

      {/* Save Email Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h3 className="text-lg font-bold mb-4">Save as Template</h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase" style={{ color: 'var(--text-tertiary)' }}>
                  Template Name
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., Follow-up"
                  className="w-full mt-2 p-2 border rounded text-sm"
                  style={{ borderColor: 'var(--border-light)' }}
                  autoFocus
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowTemplateModal(false);
                  setTemplateName('');
                }}
                className="flex-1 py-2 px-4 text-sm font-medium border rounded hover:bg-gray-50 transition-colors"
                style={{ borderColor: 'var(--border-light)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTemplate}
                className="flex-1 py-2 px-4 text-sm font-medium text-white rounded transition-colors"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Property Modal */}
      {showAddPropertyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h3 className="text-lg font-bold mb-4">Add Custom Property</h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase" style={{ color: 'var(--text-tertiary)' }}>
                  Property Name
                </label>
                <input
                  type="text"
                  value={newPropertyName}
                  onChange={(e) => setNewPropertyName(e.target.value)}
                  placeholder="e.g., Budget, Industry, Region"
                  className="w-full mt-2 p-2 border rounded text-sm"
                  style={{ borderColor: 'var(--border-light)' }}
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase" style={{ color: 'var(--text-tertiary)' }}>
                  Property Value
                </label>
                <input
                  type="text"
                  value={newPropertyValue}
                  onChange={(e) => setNewPropertyValue(e.target.value)}
                  placeholder="Enter value"
                  className="w-full mt-2 p-2 border rounded text-sm"
                  style={{ borderColor: 'var(--border-light)' }}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowAddPropertyModal(false);
                  setNewPropertyName('');
                  setNewPropertyValue('');
                }}
                className="flex-1 py-2 px-4 text-sm font-medium border rounded hover:bg-gray-50 transition-colors"
                style={{ borderColor: 'var(--border-light)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustomProperty}
                className="flex-1 py-2 px-4 text-sm font-medium text-white rounded transition-colors"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                Add Property
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
