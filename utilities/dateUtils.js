import moment from 'moment';

export default class DateUtils {
	/**
	 * @param {moment.Moment} [date]
	 */
	static parseDateToSlashFormat(date = moment()) {
		if (!moment.isMoment(date))
			throw new Error('It is not a moment object.');

		return date.format('DD/MM/YYYY');
	}

	/**
	 * Get the next business day (Monday to Friday) if the current date is in the weekend.
	 * @param {*} [date]
	 * @param {string} [format]
	 */
	static getBusinessDay(date = moment(), format = 'DD/MM/YYYY') {
		const d = moment.isMoment(date) ? date : moment(date, format);

		if (!d.isValid())
			throw new Error('Invalid date.');

		switch (d.day()) {
			case 6: // Saturday
				d.add(2, 'days');
				break;
			case 0: // Sunday
				d.add(1, 'days');
				break;
		}

		return d.format('DD/MM/YYYY');
	}

	/**
	 * @param {Array<string>} dates
	 * @param {string} [format] Can be set in formats 'DD/MM/YYYY', 'YYYY/MM/DD', 'YYYY-MM-DD'.
	 * @returns {Array<Moment>}
	 */
	static parseDatesToFormat(dates, format = 'DD/MM/YYYY') {
		const parsedDates = [];

		for (const date of dates)
			parsedDates.push(moment(date, format));

		return parsedDates;
	}
}
