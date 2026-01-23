import React, { useState, useEffect, useRef } from 'react';
import mainApi from '../../Apis/axios';

const ALLOWED_TAGS = [
    "adventure", "beach", "mountains", "history", "food", "wildlife", 
    "culture", "luxury", "budget", "road_trip", "solo", "group", 
    "trekking", "spiritual", "nature", "photography", "festivals", 
    "architecture", "offbeat", "shopping"
];

const EditTripModal = ({ trip, onClose, onUpdate }) => {
    const descriptionRef = useRef(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        tags: [],
        startDate: '',
        endDate: '',
        visibility: 'public',
        travelBudget: 0,
        isArchived: false,
        isCompleted: false,
        destinations: [],
        coverPhoto: null
    });

    const [previewUrl, setPreviewUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState('');
    
    const today = new Date().toISOString().split('T')[0];
    const isPastTrip = formData.endDate && formData.endDate < today;

    useEffect(() => {
        if (trip) {
            setFormData({
                title: trip.title || '',
                description: trip.description || '',
                tags: trip.tags || [],
                startDate: trip.startDate ? new Date(trip.startDate).toISOString().split('T')[0] : '',
                endDate: trip.endDate ? new Date(trip.endDate).toISOString().split('T')[0] : '',
                visibility: trip.visibility || 'public',
                travelBudget: trip.travelBudget || 0,
                isArchived: trip.isArchived || false,
                isCompleted: trip.isCompleted || false,
                destinations: trip.destinations && trip.destinations.length > 0 
                    ? trip.destinations 
                    : [{ city: '', state: '', country: '' }],
                coverPhoto: null
            });
            if (trip.coverPhoto?.url) {
                setPreviewUrl(trip.coverPhoto.url);
            }
        }
    }, [trip]);

    // Auto-resize description textarea
    useEffect(() => {
        if (descriptionRef.current) {
            descriptionRef.current.style.height = "auto";
            descriptionRef.current.style.height = descriptionRef.current.scrollHeight + "px";
        }
    }, [formData.description]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'title' && value.length > 100) return;
        if (name === 'description' && value.length > 1000) return;

        if (name === 'isCompleted') {
             if (checked) {
                 // If marking as completed, set end date to today
                 setFormData(prev => ({
                     ...prev,
                     isCompleted: true,
                     endDate: today
                 }));
             } else {
                 setFormData(prev => ({ ...prev, isCompleted: false }));
             }
             return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, coverPhoto: file }));
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleTagToggle = (tag) => {
        setFormData(prev => {
            const newTags = prev.tags.includes(tag)
                ? prev.tags.filter(t => t !== tag)
                : [...prev.tags, tag];
            return { ...prev, tags: newTags };
        });
    };

    // Destination handling
    const handleDestinationChange = (index, field, value) => {
        const updatedDestinations = [...formData.destinations];
        updatedDestinations[index] = { ...updatedDestinations[index], [field]: value };
        setFormData(prev => ({ ...prev, destinations: updatedDestinations }));
    };

    const addDestination = () => {
        setFormData(prev => ({
            ...prev,
            destinations: [...prev.destinations, { city: '', state: '', country: '' }]
        }));
    };

    const removeDestination = (index) => {
        if (formData.destinations.length > 1) {
            setFormData(prev => ({
                ...prev,
                destinations: prev.destinations.filter((_, i) => i !== index)
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setUploadProgress(0);
        setError('');

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('startDate', formData.startDate);
            data.append('endDate', formData.endDate);
            data.append('visibility', formData.visibility);
            data.append('travelBudget', formData.travelBudget);
            data.append('isArchived', formData.isArchived);
            data.append('isCompleted', formData.isCompleted);
            
            // Serialize complex data
            // Filter out empty destinations before sending
            const validDestinations = formData.destinations.filter(d => d.city.trim() !== '' && d.country.trim() !== '');
            data.append('tags', JSON.stringify(formData.tags));
            data.append('destinations', JSON.stringify(validDestinations));

            if (formData.coverPhoto) {
                data.append('coverPhoto', formData.coverPhoto);
            }

            const response = await mainApi.patch(`/api/trips/${trip._id}`, data, {
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });

            if (onUpdate && response.data.trip) {
                onUpdate(response.data.trip);
            }
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update trip");
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    return (
        <>
            {loading && (
                <div className="fixed top-0 left-0 w-full h-1 z-[110]">
                    <div 
                        className="h-full bg-red-600 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(220,38,38,0.7)]"
                        style={{ width: `${uploadProgress}%` }}
                    ></div>
                </div>
            )}
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                    <h2 className="text-2xl font-bold text-gray-800">Edit Trip</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition-colors">
                        <i className="bx bx-x text-3xl"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg">{error}</div>}

                    {/* Cover Photo */}
                    <div className="space-y-2">
                        <label className="block font-semibold text-gray-700">Cover Photo</label>
                        <div className="relative w-full h-64 bg-gray-100 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 hover:border-red-500 transition-colors group cursor-pointer">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Cover" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <i className="bx bx-image-add text-5xl mb-2"></i>
                                    <span className="text-lg font-medium  ">Upload Cover Photo</span>
                                </div>
                            )}
                            <input 
                                type="file" 
                                onChange={handleFileChange} 
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer z-20"
                            />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                <span className="bg-white text-black font-semibold text-lg flex items-center gap-2 px-5 py-3 rounded-lg">
                                    <i className='bx bx-edit'></i> Change Photo
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="block font-semibold text-gray-700">Title</label>
                            <span className={`text-sm ${formData.title.length === 100 ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                                {formData.title.length} / 100
                            </span>
                        </div>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            maxLength={100}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none transition-all"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="block font-semibold text-gray-700">Description</label>
                            <span className={`text-sm ${formData.description.length === 1000 ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                                {formData.description.length} / 1000
                            </span>
                        </div>
                        <textarea
                            ref={descriptionRef}
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            maxLength={1000}
                            rows="1"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none resize-none overflow-hidden transition-all min-h-[100px]"
                        ></textarea>
                    </div>

                    {/* Destinations */}
                    <div className="space-y-4 bg-[#edf2f4] p-4 sm:p-6 rounded-xl">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-300 pb-3 gap-3">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Destinations</h3>
                                <p className="text-sm text-gray-500">Manage your trip stops</p>
                            </div>
                            <button 
                                type="button" 
                                onClick={addDestination}
                                className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors shadow-md w-full sm:w-auto justify-center"
                            >
                                <i className='bx bx-plus text-xl'></i> Add Destination
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            {formData.destinations.map((dest, index) => (
                                <div key={index} className="bg-white p-5 rounded-xl shadow-md border border-gray-100 relative group transition-all hover:shadow-lg">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-red-500 text-white text-sm font-bold px-3 py-0.5 rounded-full">#{index + 1}</span>
                                            <h4 className="font-bold text-gray-700">Destination</h4>
                                        </div>
                                        {formData.destinations.length > 1 && (
                                            <button 
                                                type="button" 
                                                onClick={() => removeDestination(index)}
                                                className=" text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
                                                title="Remove destination"
                                            >
                                                <i className='bx bx-trash text-xl'></i>
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">City</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Paris"
                                                value={dest.city}
                                                onChange={(e) => handleDestinationChange(index, 'city', e.target.value)}
                                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-red-400 outline-none transition-all font-medium"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">State</label>
                                            <input
                                                type="text"
                                                placeholder="Optional"
                                                value={dest.state}
                                                onChange={(e) => handleDestinationChange(index, 'state', e.target.value)}
                                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-red-400 outline-none transition-all font-medium"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Country</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. France"
                                                value={dest.country}
                                                onChange={(e) => handleDestinationChange(index, 'country', e.target.value)}
                                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-red-400 outline-none transition-all font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Travel Budget */}
                    <div className="space-y-2">
                        <label className="block font-semibold text-gray-700">Travel Budget</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                            <input
                                type="number"
                                name="travelBudget"
                                value={formData.travelBudget}
                                onChange={handleChange}
                                min="0"
                                className="w-full p-3 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Dates & Visibility */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="block font-semibold text-gray-700">Start Date</label>
                            <input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 outline-none"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block font-semibold text-gray-700">End Date</label>
                            <input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 outline-none"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block font-semibold text-gray-700">Visibility</label>
                            <select
                                name="visibility"
                                value={formData.visibility}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 outline-none"
                            >
                                <option value="public">Public</option>
                                <option value="followers">Followers</option>
                                <option value="close_friends">Close Friends</option>
                                <option value="private">Private</option>
                            </select>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                        <label className="block font-semibold text-gray-700">Tags</label>
                        <div className="flex flex-wrap gap-2 p-4 border border-gray-300 rounded-lg bg-gray-50 max-h-48 overflow-y-auto">
                            {ALLOWED_TAGS.map(tag => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => handleTagToggle(tag)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                        formData.tags.includes(tag)
                                            ? 'bg-red-500 text-white shadow-md transform scale-105'
                                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                                    }`}
                                >
                                    #{tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Status Toggles & Info */}
                    <div className="bg-red-50 p-6 rounded-xl border border-blue-100 space-y-4">
                        <div className="flex items-start gap-3 text-red-800 mb-4">
                            <i className='bx bx-info-circle text-2xl mt-1'></i>
                            <div className="text-sm">
                                <p className="font-semibold mb-1">Trip Status Information:</p>
                                <ul className="list-disc pl-4 space-y-1">
                                    <li><strong>Archive Trip:</strong> Hides the trip from your main profile but keeps it saved. Good for old trips you don't want to showcase.</li>
                                    <li><strong>Mark Completed:</strong> Indicates the trip has finished. This moves it to the "Past Trips" section and updates your travel stats.</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-8">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        name="isArchived"
                                        checked={formData.isArchived}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-14 h-7 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-orange-500"></div>
                                </div>
                                <span className="font-semibold text-gray-700 group-hover:text-orange-600 transition-colors">Archive Trip</span>
                            </label>

                            <label className={`flex items-center gap-3 cursor-pointer group ${isPastTrip ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        name="isCompleted"
                                        checked={isPastTrip ? true : formData.isCompleted}
                                        disabled={isPastTrip}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-14 h-7 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
                                </div>
                                <span className="font-semibold text-gray-700 group-hover:text-green-600 transition-colors">
                                    {isPastTrip ? 'Completed (Past Trip)' : 'Mark Completed'}
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-4 pt-6 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-2.5 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            {loading && <i className="bx bx-loader-alt animate-spin"></i>}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
        </>
    );
};

export default EditTripModal;
