import Modal from '../common/Modal';
import Button from '../common/Button';

const LabResultDetailsModal = ({ labResult, onClose }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'normal':
        return 'bg-green-100 text-green-800';
      case 'abnormal':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Lab Result Details" size="large">
      <div className="space-y-6">
        {/* Header Info */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold text-gray-900">{labResult.labOrderName}</h3>
          <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Ordered Date:</span>
              <p className="text-gray-600">{new Date(labResult.orderedDate).toLocaleDateString()}</p>
            </div>
            {labResult.collectionDate && (
              <div>
                <span className="font-medium text-gray-700">Collection Date:</span>
                <p className="text-gray-600">{new Date(labResult.collectionDate).toLocaleDateString()}</p>
              </div>
            )}
            {labResult.resultDate && (
              <div>
                <span className="font-medium text-gray-700">Result Date:</span>
                <p className="text-gray-600">{new Date(labResult.resultDate).toLocaleDateString()}</p>
              </div>
            )}
            {labResult.orderingDoctor && (
              <div>
                <span className="font-medium text-gray-700">Ordered by:</span>
                <p className="text-gray-600">
                  Dr. {labResult.orderingDoctor.firstName} {labResult.orderingDoctor.lastName}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Test Results */}
        {labResult.tests && labResult.tests.length > 0 ? (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Test Results</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Test Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Result
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference Range
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {labResult.tests.map((test, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{test.testName}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {test.resultValue} {test.unit}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{test.referenceRange}</td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            test.status
                          )}`}
                        >
                          {test.status}
                        </span>
                        {test.notes && (
                          <p className="mt-1 text-xs text-gray-500 italic">{test.notes}</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No individual test results available yet.</p>
          </div>
        )}

        {/* Overall Notes */}
        {labResult.notes && (
          <div className="bg-gray-50 rounded-md p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Additional Notes</h4>
            <p className="text-sm text-gray-700">{labResult.notes}</p>
          </div>
        )}

        {/* Overall Status */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">Overall Status:</span>
            <span
              className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${
                labResult.overallStatus === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : labResult.overallStatus === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {labResult.overallStatus}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default LabResultDetailsModal;
