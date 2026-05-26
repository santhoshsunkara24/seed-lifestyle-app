export const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
        let date;
        // Prevent timezone shift for YYYY-MM-DD strings by parsing them in local time
        if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            const [year, month, day] = dateString.split('-').map(Number);
            date = new Date(year, month - 1, day);
        } else {
            date = new Date(dateString);
        }
        
        // Check if valid date
        if (isNaN(date.getTime())) return dateString;

        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    } catch (e) {
        return dateString;
    }
};
