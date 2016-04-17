import React from 'react';
export default (props) => {
  return (
    <aside id="credits">
      <div className="rolling-credits slide-out-up animated">
        <div className="developers">
          <h2 className="offset">Developers <small>(alphabetically)</small></h2>
          <h4>Chris Hollands</h4>
          <h4>Dave Gurnell</h4>
          <h4>Simon Elliott</h4>
          <h4>Thomas Parslow</h4>
          <h4>Yann Eves</h4>
        </div>
        <div className="button" onClick={ props.onClose }>Close</div>
        <div className="thanks">
          <h3 className="offset">With thanks to</h3>
          <small>Alice Clarke</small>
          <small>Emily Carpenter</small>
          <small>James Hugman</small>
          <small>Kai Eves-Hollis</small>
        </div>
        <div className="legal-bit">
          <hr />
          <small>&copy; 2016 Classique TM</small>
        </div>
        <div  className="button" onClick={ props.onClose }>Close</div>
      </div>
    </aside>
  );
};
