Vue.component( 'v-input-file', {
  template : `
    <div>
      <div style="border: 2px dashed silver; height: 200px; position: relative; overflow: auto">
        <span v-if="!value" class="pa-3 d-inline-block">
          NENHUM ARQUIVO SELECIONADO
        </span>
        <div v-else>
          <div style="position: absolute; z-index: 1" class="pa-2">
            <div>
              <strong>Nome:</strong>
              <span v-text="value.name"></span>
            </div>
            <div>
              <strong>Tamanho:</strong>
              <span v-text="fileSize( value.size )"></span>
            </div>
            <div v-if="dimensions">
              <strong>Dimensões:</strong>
              <span v-text="dimensions[0]"></span> x
              <span v-text="dimensions[1]"></span>
            </div>
          </div>
          <img
            ref     = 'image'
            :src    = "image"
            :style  = "'transform-origin: top left; transform: scale(' + ( zoom / 100 ) + ')'"
          />
        </div>
        <input
          @change   = "selecionarArquivo( $event.target.files[ 0 ] )"
          type      = "file"
          style     = "position: absolute; border: 1px solid red; top: 0; left: 0; width: 100%; height: 100%; opacity: 0"
          :disabled = "disabled"
          />
      </div>
      <v-slider
        v-model           = "zoom"
        :hint             = "'Zoom: ' + zoom + '%'"
        :disabled         = "!value || disabled"
        :persistent-hint  = "value"
        thumb-label       = "always"
      ></v-slider>
    </div>
  `,

  props : ['value', 'disabled'],

  data() {
    return {
      image       : null,
      dimensions  : null,
      zoom        : 100,
    };
  },

  methods : {
    selecionarArquivo( file ) {
      this.imagem     = null;
      this.dimensions = null;
      this.value      = file;
      this.$emit( 'input', this.value );

      if ( !file ) {
        return;
      }

      var component = this;

      var reader = new FileReader();
          reader.addEventListener( "load", function( res ) {
            component.image = res.target.result;

            Vue.nextTick( function() {
              component.dimensions = [component.$refs.image.width, component.$refs.image.height];
            });
          }, false );
          reader.readAsDataURL( file );
    },

    fileSize( input, zero_format ) {
      input = parseFloat( input );

      if ( !input ) {
        return zero_format;
      }

      if ( input < 1024 ) {
        plural  = input >= 2 && i > 10
          ? 's'
          : '';
        return input + ' byte' + plural;
      }

      var measure   = 'Geob';
      var plural    = 's';
      var measures  = [
        'Kb',
        'Mb',
        'Gb',
        'Tb',
        'Pb',
        'Eb',
        'Zb',
        'Yb',
        'Bb',
        'Geob',
      ];
      
      for ( var i in measures ) {
        input /= 1024;
        
        if ( input >= 1024 ) {
          continue;
        }

        measure = measures[ i ];
        plural  = input >= 2 && i > 10
          ? 's'
          : '';
        break;
      }

      return input
        .toFixed( 1 )
        .replace( '.', ',' ) + ' ' + measure + plural;
    },
  },
});
