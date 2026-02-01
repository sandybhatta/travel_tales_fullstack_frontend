import React, { useState, useEffect, useRef } from 'react';
import { useUpdateTripMutation } from '../../slices/tripApiSlice';

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
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState('');
    
    // RTK Query Mutation
    const [updateTrip, { isLoading: loading }] = useUpdateTripMutation();
    
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
        setUploadProgress(0); // Cannot track progress with fetch easily, might simulate or ignore
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
            const validDestinations = formData.destinations.filter(d => d.city.trim() !== '' || d.country.trim() !== '' || d.state.trim() !== '');
            data.append('tags', JSON.stringify(formData.tags));
            data.append('destinations', JSON.stringify(validDestinations));

            if (formData.coverPhoto) {
                data.append('coverPhoto', formData.coverPhoto);
            }

            // Note: onUploadProgress is Axios specific. fetchBaseQuery doesn't support it out of the box easily.
            // We'll skip the progress bar for now or just show a loading spinner.
            
            const result = await updateTrip({ tripId: trip._id, data }).unwrap();

            if (onUpdate && result.trip) {
                onUpdate(result.trip);
            }
            onClose();
        } catch (err) {
            setError(err?.data?.message || "Failed to update trip");
        }
    };

    return (
        <>
            {loading && (
                <div className="fixed top-0 left-0 w-full h-1 z-[110]">
                    <div 
                        className="h-full bg-[#EF233C] animate-pulse shadow-[0_0_10px_rgba(239,35,60,0.7)]"
                        style={{ width: `100%` }}
                    ></div>
                </div>
            )}
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                    <h2 className="text-2xl font-bold text-gray-800">Edit Trip</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-[#EF233C] transition-colors">
                        <i className="bx bx-x text-3xl"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    {error && <div className="bg-red-100 text-[#EF233C] p-3 rounded-lg border border-red-200">{error}</div>}

                    {/* Cover Photo */}
                    <div className="space-y-2">
                        <label className="block font-semibold text-gray-700">Cover Photo</label>
                        <div className="relative w-full h-64 rounded-2xl overflow-hidden group cursor-pointer shadow-md">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Cover" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center text-gray-400">
                                    <i className="bx bx-image-add text-6xl mb-2"></i>
                                    <span className="text-lg font-medium">Upload Cover Photo</span>
                                </div>
                            )}
                            <input 
                                type="file" 
                                onChange={handleFileChange} 
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer z-20"
                            />
                            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 backdrop-blur-[2px]">
                                <i className='bx bx-camera text-4xl text-white mb-2'></i>
                                <span className="text-white font-semibold text-lg">Change Cover Photo</span>
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="block font-bold text-gray-700 text-lg">Title</label>
                            <span className={`text-sm font-medium ${formData.title.length === 100 ? 'text-[#EF233C]' : 'text-gray-500'}`}>
                                {formData.title.length} / 100
                            </span>
                        </div>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            maxLength={100}
                            placeholder="Enter trip title..."
                            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#EF233C] focus:border-[#EF233C] outline-none transition-all text-lg font-medium placeholder-gray-400 bg-gray-50 focus:bg-white"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="block font-bold text-gray-700 text-lg">Description</label>
                            <span className={`text-sm font-medium ${formData.description.length === 1000 ? 'text-[#EF233C]' : 'text-gray-500'}`}>
                                {formData.description.length} / 1000
                            </span>
                        </div>
                        <textarea
                            ref={descriptionRef}
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            maxLength={1000}
                            rows="3"
                            placeholder="Describe your adventure..."
                            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#EF233C] focus:border-[#EF233C] outline-none resize-none overflow-hidden transition-all min-h-[120px] bg-gray-50 focus:bg-white"
                        ></textarea>
                    </div>

                    {/* Destinations */}
                    <div className="space-y-6 bg-[#edf2f4] p-6 rounded-2xl shadow-inner">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-300/50 pb-4 gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <i className='bx bx-map-alt text-[#EF233C]'></i> Destinations
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">Where are you going?</p>
                            </div>
                            <button 
                                type="button" 
                                onClick={addDestination}
                                className="flex items-center gap-2 bg-[#EF233C] text-white px-5 py-2.5 rounded-xl hover:bg-[#D90429] transition-all shadow-lg hover:shadow-xl w-full sm:w-auto justify-center font-semibold transform hover:-translate-y-0.5"
                            >
                                <i className='bx bx-plus text-xl'></i> Add
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            {formData.destinations.map((dest, index) => (
                                <div key={index} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 relative group hover:shadow-md transition-all">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-bold text-gray-700 flex items-center gap-2">
                                            <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-lg border border-gray-200">#{index + 1}</span>
                                            Destination
                                        </h4>
                                        {formData.destinations.length > 1 && (
                                            <button 
                                                type="button" 
                                                onClick={() => removeDestination(index)}
                                                className="text-gray-400 hover:text-[#EF233C] transition-colors p-2 rounded-full hover:bg-red-50"
                                                title="Remove destination"
                                            >
                                                <i className='bx bx-trash text-xl'></i>
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">City</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Paris"
                                                value={dest.city}
                                                onChange={(e) => handleDestinationChange(index, 'city', e.target.value)}
                                                className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#EF233C] outline-none transition-all font-medium text-gray-700 placeholder-gray-300"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">State</label>
                                            <input
                                                type="text"
                                                placeholder="Optional"
                                                value={dest.state}
                                                onChange={(e) => handleDestinationChange(index, 'state', e.target.value)}
                                                className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#EF233C] outline-none transition-all font-medium text-gray-700 placeholder-gray-300"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Country</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. France"
                                                value={dest.country}
                                                onChange={(e) => handleDestinationChange(index, 'country', e.target.value)}
                                                className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#EF233C] outline-none transition-all font-medium text-gray-700 placeholder-gray-300"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Travel Budget */}
                    <div className="space-y-2">
                        <label className="block font-bold text-gray-700 text-lg">Travel Budget</label>
                        <div className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg group-focus-within:text-[#EF233C] transition-colors">$</span>
                            <input
                                type="number"
                                name="travelBudget"
                                value={formData.travelBudget}
                                onChange={handleChange}
                                min="0"
                                className="w-full p-4 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#EF233C] focus:border-[#EF233C] outline-none transition-all text-lg font-medium bg-gray-50 focus:bg-white"
                            />
                        </div>
                    </div>

                    {/* Dates & Visibility */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="block font-bold text-gray-700">Start Date</label>
                            <input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#EF233C] outline-none bg-gray-50 focus:bg-white transition-all"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block font-bold text-gray-700">End Date</label>
                            <input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#EF233C] outline-none bg-gray-50 focus:bg-white transition-all"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block font-bold text-gray-700">Visibility</label>
                            <div className="relative">
                                <select
                                    name="visibility"
                                    value={formData.visibility}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#EF233C] outline-none bg-gray-50 focus:bg-white transition-all appearance-none"
                                >
                                    <option value="public">Public</option>
                                    <option value="followers">Followers</option>
                                    <option value="close_friends">Close Friends</option>
                                    <option value="private">Private</option>
                                </select>
                                <i className='bx bx-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-xl text-gray-500 pointer-events-none'></i>
                            </div>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                        <label className="block font-bold text-gray-700 text-lg">Tags</label>
                        <div className="flex flex-wrap gap-2 p-4 border border-gray-200 rounded-xl bg-gray-50 max-h-48 overflow-y-auto custom-scrollbar">
                            {ALLOWED_TAGS.map(tag => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => handleTagToggle(tag)}
                                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                                        formData.tags.includes(tag)
                                            ? 'bg-[#EF233C] text-white shadow-md transform scale-105'
                                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                                    }`}
                                >
                                    #{tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Status Toggles & Info */}
                    <div className="bg-red-50 p-6 rounded-2xl border border-red-100 space-y-5">
                        <div className="flex items-start gap-4 text-[#EF233C]">
                            <i className='bx bx-info-circle text-2xl mt-0.5 shrink-0'></i>
                            <div className="text-sm">
                                <p className="font-bold mb-2 text-base">Trip Status Actions:</p>
                                <ul className="space-y-2 text-gray-700">
                                    <li className="flex items-start gap-2">
                                        <span className="font-bold text-[#EF233C]">•</span>
                                        <span><strong>Mark as Completed:</strong> If enabled, the trip end date will automatically update to today. This moves the trip to your "Past Trips" history. If the trip's end date is already in the past, this is enabled by default and cannot be changed.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="font-bold text-[#EF233C]">•</span>
                                        <span><strong>Archive Trip:</strong> Hides this trip from your public profile. It will be moved to the "Archived" tab where only you can see it. You can restore it later.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-8 pt-2 border-t border-red-200/50">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        name="isArchived"
                                        checked={formData.isArchived}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-14 h-7 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-orange-500 shadow-inner"></div>
                                </div>
                                <span className="font-bold text-gray-700 group-hover:text-orange-600 transition-colors">Archive Trip</span>
                            </label>

                            <label className={`flex items-center gap-3 cursor-pointer group ${isPastTrip ? 'opacity-70 cursor-not-allowed' : ''}`}>
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        name="isCompleted"
                                        checked={isPastTrip ? true : formData.isCompleted}
                                        disabled={isPastTrip}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-14 h-7 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#EF233C] shadow-inner"></div>
                                </div>
                                <span className="font-bold text-gray-700 group-hover:text-[#EF233C] transition-colors">
                                    {isPastTrip ? 'Completed (Past Trip)' : 'Mark as Completed'}
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 bg-[#EF233C] text-white font-bold rounded-xl hover:bg-[#D90429] transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95"
                        >
                            {loading ? <i className="bx bx-loader-alt animate-spin text-xl"></i> : <i className='bx bx-save text-xl'></i>}
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
