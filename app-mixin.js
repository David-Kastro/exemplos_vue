var appMixin = {
  el : '#main',

  data : Object.assign( dados, {
    sidebar         : false,
    fila_esc        : [],
    trocar_senha    : {
      dialog        : false,
      nova_senha    : '',
      repetir_senha : '',
    },
    msg             : {},
    enviando        : false,
  }),

  mounted() {
    setTimeout( function() {
      document.querySelector( '#carregando' ).classList.add( 'discarted' );
      document.querySelector( '#main' ).classList.add( 'loaded' );
    }, 1 );
  },

  methods : {
    copy( obj ) {
      return JSON.parse( JSON.stringify( obj ) );
    },

    int( value ) {
      return parseInt( value, 10 );
    },

    capturarTecla( event ) {
      if ( event.code != 'Escape' ) {
        return;
      }

      this.msg.show = false;

      if ( this.fila_esc.length > 0 ) {
        fn = this.fila_esc.pop();
        fn();
        return;
      }

      this.cancelarEdicao();
    },

    iniciarTrocaSenha() {
      this.trocar_senha.dialog = true;

      Vue.nextTick( function() {
        app.focarElemento( '#input_nova_senha' );
      });
    },

    trocarSenha() {
      this.enviando     = true;

      var url_servico   = this.url.base + '/pessoas/trocar-senha.json';
      var dados         = {nova_senha : this.trocar_senha.nova_senha};

      axios
        .post( url_servico, dados )
        .then( function( res ) {
          app.enviando  = false;
          app.msg = {
            type  : res.data.type,
            title : res.data.title,
            msg   : res.data.msg,
            show  : true,
          };
          
          if ( res.data.type != 'success' ) {
            return;
          }

          app.trocar_senha.nova_senha     = '';
          app.trocar_senha.repetir_senha  = '';
          app.trocar_senha.dialog         = false;
        })
        .catch( function( res ) {
          app.enviando  = false;
          app.msg = {
            type  : 'error',
            title : 'Erro ao consultar servidor',
            msg   : 'Não foi possível trocar a senha.',
            show  : true,
          };
        });
    },

    dataHora( input ) {
      if( !input || input.substr( 0, 10 ) === '0000-00-00' || input === '0000-00-00 00:00:00' ) {
        return '-';
      }
      var data = input
        .substr( 0, 10 )
        .split( '-' )
        .reverse()
        .join( '/' );

      var hora = input
        .substr( 10 );
        hora = !hora
          ? ''
          : ', às ' + hora + ' hs';
      return data + hora;
    },

    telefone( telefone, ddd ) {
      if ( !telefone || telefone == 0 ) {
        return '-';
      }

      telefone  = '' + telefone;
      
      if ( !ddd && telefone > 999999999 ) {
        ddd       = telefone.substr( 0, 2 );
        telefone  = telefone.substr( 2 );
      }

      telefone    = telefone.replace( /(\d+)(\d{4})$/, '$1-$2' );

      var retorno = ddd
        ? `(${ddd}) ${telefone}`
        : telefone;

      return retorno;
    },

    /**
     * VALIDAÇÕES
     */
    cpfValido( input ) {
      if ( !input ) {
        return false;
      }

      input
        .toString()
        .replace( /\D/g, '' );
      
      if ( !input ) {
        return false;
      }
      
      input =( '0000000000' + input )
        .substr( -11 );
      var invalidNumbers = [
        '00000000000',
        '11111111111',
        '22222222222',
        '33333333333',
        '44444444444',
        '55555555555',
        '66666666666',
        '77777777777',
        '88888888888',
        '99999999999',
      ];

      for ( var i in invalidNumbers ) {
        if ( input == invalidNumbers[ i ] ) {
          return false;
        }
      }

      for ( var t = 9; t < 11; t++ ) {
        for( var d = 0, c = 0; c < t; c++ ) {
          d += input[ c ] * ( ( t + 1 ) - c )
        }
        
        d = ( ( 10 * d ) % 11 ) % 10;

        if ( input[ c ] != d ) {
          return false;
        }
      }
      
      return true;
    },

    ipValido( input )
    {
      if ( !input )
      {
        return false;
      }

      var valid = false;
      var blocks = input.split(".");
      // console.log(blocks);
      if ( blocks.length == 4 )
      {
        for ( var i in blocks )
        {
          if ( parseInt(blocks[i-1]) < 0 || parseInt(blocks[i-1]) > 255)
          {
            valid = false;
          }
          else
          {
            if( blocks[i-1] == "" )
            {
              valid = false
            }
            else
            {
              valid = true;
            }
          }
        }       
      }
      else
      {
        valid = false;
      }

      return valid;
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

    focarElemento( elemento ) {
      document.querySelector( elemento ).focus();
    },

    editar( acao, item, el ) {
      if ( acao == 'cadastrar' ) {
        item = {};
      }

      this.editando = {
        acao        : acao,
        item        : this.copy( item ),
      };

      Vue.nextTick( function() {
        if ( el ) {
          document.querySelector( el ).focus();
        }
      });
    },

    cancelarEdicao() {
      this.editando = {
        acao        : null,
        item        : {},
      };
    },

    opts( itens, field_text, opcao_nula ) {
      var opts = [];

      if ( opcao_nula ) {
        opts.push({value: null, text: opcao_nula});
      }

      for ( var i in itens ) {
        var text = field_text
          ? itens[i][ field_text ]
          : itens[i];
        opts.push({value: i, text: text});
      }

      return opts;
    },
  },
};
