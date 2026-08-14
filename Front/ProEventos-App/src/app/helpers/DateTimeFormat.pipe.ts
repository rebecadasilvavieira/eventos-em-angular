import { Constants } from './../util/Constants';
import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'DateFormatPipe',
})
export class DateTimeFormatPipe extends DatePipe implements PipeTransform {

  transform(value: any, args?: any): any {

    if (!value) {
      return '';
    }

    if (typeof value === 'string' && value.includes('/')) {
      const partes = value.split(' ');
      const data = partes[0].split('/');
      const hora = partes[1] || '00:00:00';

      value = `${data[2]}-${data[1]}-${data[0]}T${hora}`;
    }

    return super.transform(value, Constants.DATE_TIME_FMT);
  }
}
