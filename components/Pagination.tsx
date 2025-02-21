import React from 'react';
import { Button, Form } from 'react-bootstrap';
import { 
  FaAngleLeft, 
  FaAngleRight, 
  FaAngleDoubleLeft, 
  FaAngleDoubleRight 
} from 'react-icons/fa';

const Pagination = ({ 
  currentPage = 1, 
  totalPages = 1, 
  onPageChange, 
  colorsPerPage = 20,
  onColorsPerPageChange 
}: any) => {
  // Ensure we have valid numbers
  const page = Math.max(1, currentPage);
  const total = Math.max(1, totalPages);
  const itemsPerPage = colorsPerPage || 20;

  return (
    <div className="d-flex align-items-center justify-content-center gap-4 py-4">
      <div className="d-flex align-items-center gap-2">
        <Button 
          variant="outline-secondary"
          size="sm"
          disabled={page === 1}
          onClick={() => onPageChange(1)}
        >
          <FaAngleDoubleLeft />
        </Button>
        <Button 
          variant="outline-secondary"
          size="sm"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          <FaAngleLeft />
        </Button>
        
        <span className="mx-2">
          {page}
        </span>
        
        <Button 
          variant="outline-secondary"
          size="sm"
          disabled={page === total}
          onClick={() => onPageChange(page + 1)}
        >
          <FaAngleRight />
        </Button>
        <Button 
          variant="outline-secondary"
          size="sm"
          disabled={page === total}
          onClick={() => onPageChange(total)}
        >
          <FaAngleDoubleRight />
        </Button>
      </div>

      <div className="d-flex align-items-center gap-2">
        <span className="text-muted">Colors per page:</span>
        <Form.Select 
          size="sm"
          style={{ width: '80px' }}
          value={itemsPerPage}
          onChange={(e) => onColorsPerPageChange(Number(e.target.value))}
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="30">30</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </Form.Select>
      </div>

      <div className="">Total Pages - {totalPages}</div>
    </div>
  );
};

export default Pagination;