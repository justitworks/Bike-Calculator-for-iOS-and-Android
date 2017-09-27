function Queue(size) {
  this.stac = new Array();
  this.addItem = function(item) {
      if (this.stac.indexOf(item) > -1) {
          this.stac.splice(this.stac.indexOf(item), 1);
          this.stac.unshift(item);
      } else {
          if (this.stac.length == size) {
              this.stac.pop();
              this.stac.unshift(item);
          } else {
            this.stac.unshift(item);
          }
      }
  }
}
