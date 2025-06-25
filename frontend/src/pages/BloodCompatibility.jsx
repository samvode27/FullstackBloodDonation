import React, { useState } from 'react';

const bloodTypeInfo = {
  'a+': { donateTo: ['A+', 'AB+'], receiveFrom: ['A+', 'A-', 'O+', 'O-'] },
  'a-': { donateTo: ['A+', 'A-', 'AB+', 'AB-'], receiveFrom: ['A-', 'O-'] },
  'b+': { donateTo: ['B+', 'AB+'], receiveFrom: ['B+', 'B-', 'O+', 'O-'] },
  'b-': { donateTo: ['B+', 'B-', 'AB+', 'AB-'], receiveFrom: ['B-', 'O-'] },
  'ab+': { donateTo: ['AB+'], receiveFrom: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  'ab-': { donateTo: ['AB+', 'AB-'], receiveFrom: ['A-', 'B-', 'AB-', 'O-'] },
  'o+': { donateTo: ['A+', 'B+', 'AB+', 'O+'], receiveFrom: ['O+', 'O-'] },
  'o-': { donateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], receiveFrom: ['O-'] },
};

const BloodCompatibility = () => {
  const [selectedType, setSelectedType] = useState('all');

  const renderTypes = (types) =>
    types.map((type) => (
      <div key={type} className="bg-white p-3 rounded-lg text-center shadow-sm">
        <div className="text-2xl font-bold text-red-600">{type}</div>
      </div>
    ));

  const activeInfo = selectedType !== 'all' ? bloodTypeInfo[selectedType] : null;

  return (
<div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-red-100 mb-12">
  {/* Blood Type Buttons */}
  <div className="flex flex-wrap justify-center gap-3 mb-8">
    {['all', 'a+', 'a-', 'b+', 'b-', 'ab+', 'ab-', 'o+', 'o-'].map((type) => (
      <button
        key={type}
        className={`px-4 py-2 rounded-full text-sm sm:text-base font-semibold border-2 transition ${
          selectedType === type
            ? 'bg-red-600 text-white border-red-600 shadow'
            : 'text-red-600 border-red-300 hover:bg-red-100'
        }`}
        onClick={() => setSelectedType(type)}
      >
        🩸 {type.toUpperCase()}
      </button>
    ))}
  </div>

  {/* Compatibility Grids */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {[
      { title: 'Can Donate To', icon: 'fas fa-hand-holding-heart', list: activeInfo?.donateTo },
      { title: 'Can Receive From', icon: 'fas fa-heart', list: activeInfo?.receiveFrom },
    ].map(({ title, icon, list }) => (
      <div key={title}>
        <h3 className="text-xl font-bold flex items-center gap-2 mb-3 text-gray-900">
          <i className={`${icon} text-red-500`}></i> {title}
        </h3>
        <div className="bg-red-50 p-4 rounded-xl grid grid-cols-2 sm:grid-cols-3 gap-3 min-h-[100px]">
          {list?.length ? (
            list.map((t) => (
              <div key={t} className="bg-white border border-red-200 text-red-600 text-sm font-medium rounded-full px-4 py-2 text-center">
                🩸 {t.toUpperCase()}
              </div>
            ))
          ) : (
          <div className="col-span-full flex flex-col items-center justify-center text-center text-gray-600 py-4">
            <i className="fas fa-info-circle text-red-500 text-2xl mb-1"></i>
            <p className="text-sm sm:text-base">
            <span className="text-red-600 font-semibold">Note:</span> Select a blood type to view compatibility.
           </p>
          </div>
          )}
        </div>
      </div>
    ))}
  </div>
</div>


  );
};

export default BloodCompatibility;
