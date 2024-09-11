/**
 * @param date Fecha en formato 'YYYY-MM-DDTHH:mm:ss.000Z'
 * @returns String con la fecha en formato 'YYYY-MM-DD HH:mm:ss'
 */
export const databaseDateToHumanDate = (date: string): string => {
    const dateArray = date.split('T')
    const datePart = dateArray[0]
    const timePartWithMiliseconds = dateArray[1].split('.')[0]
    const timePart = timePartWithMiliseconds.split('.')[0]
    return `${datePart} ${timePart}`
  }
  